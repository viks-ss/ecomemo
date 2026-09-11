import { cn } from "@/lib/utils";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-bold text-white",
        "bg-gradient-to-br from-[#059669] to-[#34d399]",
      )}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      E
    </div>
  );
}
