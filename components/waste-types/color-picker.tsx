import { cn } from "@/lib/utils";

export function ColorPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (color: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "size-9 rounded-lg transition-transform hover:scale-110",
            value === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
          )}
          style={{ background: color }}
          aria-label={color}
        />
      ))}
    </div>
  );
}
