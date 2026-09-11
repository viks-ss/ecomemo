import type { CalendarEventDTO } from "@/lib/queries/calendar-events";

export const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const DAY_NAMES_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export type DayEvent = { wasteTypeId: string; name: string; color: string };

/** Chiave YYYY-MM-DD (UTC) usata per raggruppare gli eventi per giorno. */
export function dateKeyUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function groupEventsByDate(events: CalendarEventDTO[]): Map<string, DayEvent[]> {
  const map = new Map<string, DayEvent[]>();
  for (const e of events) {
    const key = dateKeyUTC(new Date(e.date));
    const list = map.get(key) ?? [];
    list.push({ wasteTypeId: e.wasteType.id, name: e.wasteType.name, color: e.wasteType.color });
    map.set(key, list);
  }
  return map;
}

export type MonthCell = {
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: DayEvent[];
  fullDate: string;
  dateKey: string | null;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function formatFullDate(date: Date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function buildMonthCells(
  year: number,
  month: number,
  eventsByDate: Map<string, DayEvent[]>,
): MonthCell[] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // 0 = lunedì
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: MonthCell[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthLastDay - i,
      inCurrentMonth: false,
      isToday: false,
      events: [],
      fullDate: "",
      dateKey: null,
    });
  }

  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    const date = new Date(year, month, d);
    const key = dateKeyUTC(new Date(Date.UTC(year, month, d)));
    cells.push({
      day: d,
      inCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: eventsByDate.get(key) ?? [],
      fullDate: formatFullDate(date),
      dateKey: key,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({
      day: nextDay++,
      inCurrentMonth: false,
      isToday: false,
      events: [],
      fullDate: "",
      dateKey: null,
    });
  }

  return cells;
}

export type WeekDay = {
  day: number;
  dayName: string;
  isToday: boolean;
  events: DayEvent[];
  fullDate: string;
  date: Date;
};

export function buildWeekDays(weekOffset: number, eventsByDate: Map<string, DayEvent[]>): WeekDay[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const key = dateKeyUTC(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    return {
      day: date.getDate(),
      dayName: DAY_NAMES_SHORT[i],
      isToday: isSameDay(date, today),
      events: eventsByDate.get(key) ?? [],
      fullDate: formatFullDate(date),
      date,
    };
  });
}

export function getWeekPeriodLabel(weekOffset: number): string {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.getDate()}–${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

export function getMonthRangeISO(year: number, month: number): { from: string; to: string } {
  const from = new Date(Date.UTC(year, month, 1)).toISOString();
  const to = new Date(Date.UTC(year, month + 1, 0)).toISOString();
  return { from, to };
}

export function getWeekRangeISO(weekOffset: number): { from: string; to: string } {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate())).toISOString(),
    to: new Date(Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())).toISOString(),
  };
}
