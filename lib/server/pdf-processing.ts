import { prisma } from "@/lib/prisma";
import { readPdfFile } from "@/lib/server/storage";
import { extractPdfPages } from "@/lib/server/pdf-text";
import { parsePdfPages } from "@/lib/server/pdf-parser";
import { getDefaultColorForName } from "@/lib/server/waste-keywords";

/**
 * Elabora un PdfDocument già caricato: legge il file, estrae testo dalle
 * pagine selezionate, riconosce date e tipologie di rifiuto, e sostituisce
 * il calendario dell'utente con quello appena estratto. Aggiorna
 * `status`/`processingStep` progressivamente così il client può fare
 * polling con GET /api/pdf/[id]/status.
 *
 * Pensata per essere lanciata "fire and forget" dalla route di avvio
 * elaborazione (nessuna coda: un solo processo Node self-hosted).
 */
export async function processPdfDocument(docId: string): Promise<void> {
  const doc = await prisma.pdfDocument.findUnique({
    where: { id: docId },
    include: { pages: true },
  });
  if (!doc) return;

  try {
    await prisma.pdfDocument.update({
      where: { id: docId },
      data: { status: "PROCESSING", processingStep: 1, errorMessage: null },
    });

    const buffer = await readPdfFile(doc.storedPath);
    const allPages = await extractPdfPages(new Uint8Array(buffer));

    await prisma.pdfDocument.update({ where: { id: docId }, data: { processingStep: 2 } });

    const selectedPageNumbers = new Set(doc.pages.filter((p) => p.selected).map((p) => p.pageNumber));
    const selectedPages = allPages.filter((p) => selectedPageNumbers.has(p.pageNumber));

    await prisma.pdfDocument.update({ where: { id: docId }, data: { processingStep: 3 } });
    const { events, originalLabels } = parsePdfPages(selectedPages);

    await prisma.pdfDocument.update({ where: { id: docId }, data: { processingStep: 4 } });

    if (events.length === 0) {
      await prisma.pdfDocument.update({
        where: { id: docId },
        data: {
          status: "ERROR",
          errorMessage: "Non abbiamo trovato date valide nelle pagine selezionate.",
        },
      });
      return;
    }

    const uniqueNames = Array.from(new Set(events.flatMap((e) => e.wasteTypeNames)));
    const wasteTypeIdByName = new Map<string, string>();
    for (const name of uniqueNames) {
      const existing = await prisma.wasteType.findUnique({
        where: { userId_name: { userId: doc.userId, name } },
      });
      if (existing) {
        wasteTypeIdByName.set(name, existing.id);
        continue;
      }
      const created = await prisma.wasteType.create({
        data: {
          userId: doc.userId,
          name,
          originalName: originalLabels.get(name) ?? null,
          color: getDefaultColorForName(name),
        },
      });
      wasteTypeIdByName.set(name, created.id);
    }

    await prisma.pdfDocument.update({ where: { id: docId }, data: { processingStep: 5 } });

    const seen = new Set<string>();
    const eventRows = events
      .flatMap((e) =>
        e.wasteTypeNames.map((name) => ({
          userId: doc.userId,
          wasteTypeId: wasteTypeIdByName.get(name)!,
          pdfDocumentId: doc.id,
          date: e.date,
        })),
      )
      .filter((row) => {
        const key = `${row.wasteTypeId}|${row.date.getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    await prisma.$transaction([
      prisma.calendarEvent.deleteMany({ where: { userId: doc.userId } }),
      prisma.calendarEvent.createMany({ data: eventRows }),
    ]);

    await prisma.pdfDocument.update({
      where: { id: docId },
      data: { status: "PROCESSED", processingStep: 6, processedAt: new Date() },
    });
  } catch (err) {
    await prisma.pdfDocument
      .update({
        where: { id: docId },
        data: {
          status: "ERROR",
          errorMessage: err instanceof Error ? err.message : "Errore durante l'elaborazione.",
        },
      })
      .catch(() => undefined);
  }
}
