import type { WeekDay } from "@/components/calendar/calendar-helpers";
import { cn } from "@/lib/utils";

export function WeekView({
  days,
  onSelectDay,
}: {
  days: WeekDay[];
  onSelectDay: (day: WeekDay) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4 lg:grid-cols-7">
      {days.map((day, i) => (
        <div
          key={i}
          onClick={() => onSelectDay(day)}
          className="min-h-[220px] cursor-pointer bg-card p-3 transition-colors hover:bg-secondary"
        >
          <div className="mb-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {day.dayName}
            </div>
            <div
              className={cn(
                "mx-auto mt-1.5 flex size-10 items-center justify-center rounded-full text-lg font-semibold",
                day.isToday
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground",
              )}
            >
              {day.day}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {day.events.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-lg px-2.5 py-2 text-xs font-medium"
                style={{ background: `${evt.color}26`, color: evt.color }}
              >
                {evt.name}
              </div>
            ))}
            {day.events.length === 0 ? (
              <span className="pt-2 text-center text-xs italic text-muted-foreground">
                Nessuna raccolta
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
