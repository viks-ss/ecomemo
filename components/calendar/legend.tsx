import type { WasteTypeDTO } from "@/lib/queries/waste-types";

export function CalendarLegend({ wasteTypes }: { wasteTypes: WasteTypeDTO[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-4 rounded-lg border bg-card px-4 py-3">
      {wasteTypes.map((wt) => (
        <div key={wt.id} className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ background: wt.color }}
          />
          <span className="text-xs font-medium text-foreground/80">{wt.name}</span>
        </div>
      ))}
    </div>
  );
}
