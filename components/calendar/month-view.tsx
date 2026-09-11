import { DAY_NAMES_SHORT, type MonthCell } from "@/components/calendar/calendar-helpers";
import { cn } from "@/lib/utils";

export function MonthView({
  cells,
  onSelectDay,
}: {
  cells: MonthCell[];
  onSelectDay: (cell: MonthCell) => void;
}) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES_SHORT.map((name) => (
          <div
            key={name}
            className="px-1 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border">
        {cells.map((cell, i) => {
          const displayEvents = cell.events.slice(0, 2);
          const overflow = cell.events.length - 2;
          return (
            <div
              key={i}
              onClick={() => cell.inCurrentMonth && onSelectDay(cell)}
              className={cn(
                "min-h-[110px] p-2 transition-colors",
                cell.inCurrentMonth ? "cursor-pointer bg-card hover:bg-secondary" : "bg-muted/40",
              )}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[13px]",
                    cell.isToday
                      ? "bg-primary font-bold text-primary-foreground"
                      : cell.inCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                  )}
                >
                  {cell.day}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {displayEvents.map((evt, idx) => (
                  <span
                    key={idx}
                    className="block truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ background: `${evt.color}26`, color: evt.color }}
                  >
                    {evt.name}
                  </span>
                ))}
                {overflow > 0 ? (
                  <span className="pl-0.5 text-[10px] text-muted-foreground">
                    +{overflow} altre
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
