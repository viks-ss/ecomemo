"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ViewToggle } from "@/components/calendar/view-toggle";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { CalendarLegend } from "@/components/calendar/legend";
import { DayDetailDialog, type DayDetail } from "@/components/calendar/day-detail-dialog";
import {
  buildMonthCells,
  buildWeekDays,
  getMonthRangeISO,
  getWeekPeriodLabel,
  getWeekRangeISO,
  groupEventsByDate,
  MONTH_NAMES,
  type MonthCell,
  type WeekDay,
} from "@/components/calendar/calendar-helpers";
import { useHasCalendarData } from "@/lib/queries/pdf";
import { useCalendarEvents } from "@/lib/queries/calendar-events";
import { useWasteTypes } from "@/lib/queries/waste-types";
import { useTopbarAction } from "@/lib/topbar-action-context";

export default function CalendarPage() {
  const router = useRouter();
  const hasData = useHasCalendarData();
  const { data: wasteTypes } = useWasteTypes();
  const [view, setView] = useState<"month" | "week">("month");
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayDetail, setDayDetail] = useState<DayDetail>(null);

  useTopbarAction(
    hasData
      ? {
          label: "Carica nuovo PDF",
          variant: "outline",
          icon: <UploadCloud className="size-4" />,
          onClick: () => router.push("/pdf/upload"),
        }
      : null,
    [hasData, router],
  );

  const range = view === "month" ? getMonthRangeISO(year, month) : getWeekRangeISO(weekOffset);
  const { data: events, isLoading: eventsLoading } = useCalendarEvents(range.from, range.to);
  const eventsByDate = useMemo(() => groupEventsByDate(events ?? []), [events]);

  const monthCells = useMemo(
    () => buildMonthCells(year, month, eventsByDate),
    [year, month, eventsByDate],
  );
  const weekDays = useMemo(() => buildWeekDays(weekOffset, eventsByDate), [weekOffset, eventsByDate]);

  const periodLabel =
    view === "month" ? `${MONTH_NAMES[month]} ${year}` : getWeekPeriodLabel(weekOffset);

  const goPrev = () => {
    if (view === "month") {
      if (month === 0) {
        setMonth(11);
        setYear((y) => y - 1);
      } else {
        setMonth((m) => m - 1);
      }
    } else {
      setWeekOffset((w) => w - 1);
    }
  };

  const goNext = () => {
    if (view === "month") {
      if (month === 11) {
        setMonth(0);
        setYear((y) => y + 1);
      } else {
        setMonth((m) => m + 1);
      }
    } else {
      setWeekOffset((w) => w + 1);
    }
  };

  const goToday = () => {
    setMonth(new Date().getMonth());
    setYear(new Date().getFullYear());
    setWeekOffset(0);
  };

  const openMonthCell = (cell: MonthCell) => {
    setDayDetail({ fullDate: cell.fullDate, events: cell.events });
  };

  const openWeekDay = (day: WeekDay) => {
    setDayDetail({ fullDate: day.fullDate, events: day.events });
  };

  if (!hasData) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nessun calendario disponibile"
        description="Dopo aver caricato ed elaborato il PDF, qui vedrai i giorni di raccolta."
        actions={
          <Button asChild>
            <Link href="/pdf/upload">Carica PDF</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Alert className="mb-5 border-warning/60 bg-warning text-warning-foreground [&_svg]:text-warning-foreground">
        <AlertTriangle className="size-[18px]" />
        <AlertDescription className="text-warning-foreground">
          I dati sono stati estratti automaticamente dal PDF. Verifica che date e tipologie
          siano corrette.{" "}
          <Link href="/waste-types" className="font-medium underline underline-offset-2">
            Gestisci tipologie
          </Link>
        </AlertDescription>
      </Alert>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ViewToggle value={view} onChange={setView} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={goToday}>
            Oggi
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="min-w-[170px] text-center text-[15px] font-semibold text-foreground">
            {periodLabel}
          </span>
        </div>
      </div>

      {eventsLoading ? (
        <Skeleton className="h-[500px] rounded-xl" />
      ) : view === "month" ? (
        <MonthView cells={monthCells} onSelectDay={openMonthCell} />
      ) : (
        <WeekView days={weekDays} onSelectDay={openWeekDay} />
      )}

      <CalendarLegend wasteTypes={wasteTypes ?? []} />

      <DayDetailDialog detail={dayDetail} onClose={() => setDayDetail(null)} />
    </div>
  );
}
