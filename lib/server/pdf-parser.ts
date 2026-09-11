import type { PdfPageText, PdfTextItem } from "@/lib/server/pdf-text";
import { findWasteTypesInText, normalizeToken } from "@/lib/server/waste-keywords";

const ITALIAN_MONTHS = [
  "GENNAIO",
  "FEBBRAIO",
  "MARZO",
  "APRILE",
  "MAGGIO",
  "GIUGNO",
  "LUGLIO",
  "AGOSTO",
  "SETTEMBRE",
  "OTTOBRE",
  "NOVEMBRE",
  "DICEMBRE",
];

const WEEKDAY_ABBREVIATIONS = new Set([
  "LUN",
  "MAR",
  "MER",
  "GIO",
  "GIOV",
  "VEN",
  "SAB",
  "DOM",
]);

export type ParsedEvent = { date: Date; wasteTypeNames: string[] };

export type ParseResult = {
  events: ParsedEvent[];
  /** Nome canonico -> un'etichetta grezza di esempio trovata nel PDF. */
  originalLabels: Map<string, string>;
};

type Header = { x: number; monthIndex: number; year: number };

/**
 * Estrae gli eventi di raccolta da una o più pagine di testo posizionato.
 *
 * Il layout tipico di questi calendari è: intestazioni di mese in alto,
 * e sotto una o più colonne "giorno numerico + nome giorno + tipologia"
 * (spesso due colonne per mese: giorni 1-15 e 16-31). L'algoritmo non
 * assume coordinate fisse: rileva le colonne cercando i numeri di giorno
 * (1-31), le associa al mese più vicino orizzontalmente, e assegna il
 * testo restante alla riga (giorno) più vicina verticalmente.
 */
export function parsePdfPages(
  pages: PdfPageText[],
  referenceDate: Date = new Date(),
): ParseResult {
  const events: ParsedEvent[] = [];
  const originalLabels = new Map<string, string>();

  // Le intestazioni vengono risolte in ordine di lettura (pagina, poi x)
  // così un anno implicito viene dedotto in sequenza da eventuali anni
  // espliciti incontrati (es. "Gennaio 2027").
  let rollingYear: number | null = null;
  let prevMonthIndex: number | null = null;

  for (const page of pages) {
    // La fascia di intestazione si deduce dalle righe dei giorni reali,
    // non da una percentuale fissa dell'altezza pagina: sui calendari "a
    // lista" i giorni 1-2 (e i corrispettivi 16-17) possono trovarsi quasi
    // alla stessa altezza del titolo del mese, quindi un taglio percentuale
    // rischierebbe di scartare righe di giorni reali.
    const allDayNumberItems = page.items.filter(isDayNumberItem);
    const topmostDayRowY =
      allDayNumberItems.length > 0
        ? Math.max(...allDayNumberItems.map((i) => i.y))
        : page.height;
    const headerCutoffY = topmostDayRowY + 8;

    const headerCandidates = page.items.filter((i) => i.y > headerCutoffY);
    const headers = detectMonthHeaders(headerCandidates);
    const headerConsumed = new Set<PdfTextItem>(headers.flatMap((h) => h.items));
    const bodyItems = page.items.filter((i) => !headerConsumed.has(i) && i.y <= headerCutoffY);

    const resolvedHeaders: Header[] = headers.map((h) => {
      let year: number;
      if (h.explicitYear) {
        year = h.explicitYear;
        rollingYear = h.explicitYear;
      } else if (rollingYear === null) {
        year = referenceDate.getFullYear();
        rollingYear = year;
      } else {
        if (prevMonthIndex !== null && h.monthIndex < prevMonthIndex) {
          rollingYear += 1;
        }
        year = rollingYear;
      }
      prevMonthIndex = h.monthIndex;
      return { x: h.x, monthIndex: h.monthIndex, year };
    });

    if (resolvedHeaders.length === 0) continue;

    const dayNumberItems = bodyItems.filter(isDayNumberItem);
    const weekdayItems = new Set(bodyItems.filter(isWeekdayItem));
    const consumed = new Set<PdfTextItem>([...dayNumberItems, ...weekdayItems]);

    const columns = clusterByX(dayNumberItems, 25).map((colItems) => {
      const x = Math.min(...colItems.map((i) => i.x));
      const header = nearestByX(resolvedHeaders, x);
      return { x, items: colItems, header };
    });

    if (columns.length === 0) continue;

    const sortedColumnXs = columns.map((c) => c.x).sort((a, b) => a - b);
    const categoryCandidates = bodyItems.filter((i) => !consumed.has(i));

    for (const column of columns) {
      const rows = [...column.items].sort((a, b) => b.y - a.y);
      const ys = rows.map((r) => r.y);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const rowGap =
        rows.length >= 2
          ? Math.abs(rows[0].y - rows[rows.length - 1].y) / (rows.length - 1)
          : 24;
      const validYMin = minY - rowGap / 2;
      const validYMax = maxY + rowGap / 2;

      const columnLeft = column.x - 5;
      const columnRight = nextColumnBoundary(sortedColumnXs, column.x);

      const ownCandidates = categoryCandidates.filter(
        (c) => c.x >= columnLeft && c.x < columnRight && c.y >= validYMin && c.y <= validYMax,
      );

      const buffers = new Map<PdfTextItem, string[]>();
      for (const row of rows) buffers.set(row, []);

      for (const candidate of ownCandidates) {
        const nearestRow = rows.reduce((best, row) =>
          Math.abs(row.y - candidate.y) < Math.abs(best.y - candidate.y) ? row : best,
        );
        buffers.get(nearestRow)!.push(candidate.str);
      }

      for (const row of rows) {
        const day = Number(row.str);
        const daysInMonth = new Date(column.header.year, column.header.monthIndex + 1, 0).getDate();
        if (day < 1 || day > daysInMonth) continue;

        const text = (buffers.get(row) ?? []).join(" ").trim();
        if (!text) continue;

        const wasteTypeNames = findWasteTypesInText(text);
        if (wasteTypeNames.length === 0) continue;

        for (const name of wasteTypeNames) {
          if (!originalLabels.has(name)) originalLabels.set(name, text);
        }

        const date = new Date(Date.UTC(column.header.year, column.header.monthIndex, day));
        events.push({ date, wasteTypeNames });
      }
    }
  }

  return { events, originalLabels };
}

function isDayNumberItem(item: PdfTextItem): boolean {
  if (!/^\d{1,2}$/.test(item.str)) return false;
  const n = Number(item.str);
  return n >= 1 && n <= 31;
}

function isWeekdayItem(item: PdfTextItem): boolean {
  return WEEKDAY_ABBREVIATIONS.has(normalizeToken(item.str));
}

function clusterByX(items: PdfTextItem[], maxGap: number): PdfTextItem[][] {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const clusters: PdfTextItem[][] = [];
  for (const item of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && item.x - last[last.length - 1].x <= maxGap) {
      last.push(item);
    } else {
      clusters.push([item]);
    }
  }
  return clusters;
}

function nearestByX<T extends { x: number }>(candidates: T[], x: number): T {
  return candidates.reduce((best, c) => (Math.abs(c.x - x) < Math.abs(best.x - x) ? c : best));
}

function nextColumnBoundary(sortedXs: number[], currentX: number): number {
  const idx = sortedXs.indexOf(currentX);
  const next = sortedXs[idx + 1];
  return next !== undefined ? next - 5 : Number.POSITIVE_INFINITY;
}

function detectMonthHeaders(
  headerItems: PdfTextItem[],
): { x: number; monthIndex: number; explicitYear?: number; items: PdfTextItem[] }[] {
  const clusters = clusterByX([...headerItems].sort((a, b) => a.x - b.x), 60);
  const headers: { x: number; monthIndex: number; explicitYear?: number; items: PdfTextItem[] }[] = [];

  for (const cluster of clusters) {
    const rawText = cluster
      .sort((a, b) => a.x - b.x)
      .map((i) => i.str)
      .join(" ");
    const compact = normalizeToken(rawText).replace(/\s+/g, "");
    const yearMatch = rawText.match(/\b(20\d{2})\b/);

    const monthIndex = ITALIAN_MONTHS.findIndex((month) => {
      if (compact.length === 0) return false;
      return compact.includes(month) || month.includes(compact.replace(/\d/g, ""));
    });

    if (monthIndex >= 0) {
      headers.push({
        x: Math.min(...cluster.map((i) => i.x)),
        monthIndex,
        explicitYear: yearMatch ? Number(yearMatch[1]) : undefined,
        items: cluster,
      });
    }
  }

  return headers.sort((a, b) => a.x - b.x);
}
