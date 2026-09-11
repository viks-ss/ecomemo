import { cn } from "@/lib/utils";

export function ViewToggle({
  value,
  onChange,
}: {
  value: "month" | "week";
  onChange: (value: "month" | "week") => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-secondary p-0.5">
      {(["month", "week"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "h-8 rounded-md px-4 text-[13px] font-medium transition-colors",
            value === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v === "month" ? "Mese" : "Settimana"}
        </button>
      ))}
    </div>
  );
}
