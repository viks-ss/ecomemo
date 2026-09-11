import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "destructive" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success text-success-foreground border-transparent",
  warning: "bg-warning text-warning-foreground border-transparent",
  info: "bg-info text-info-foreground border-transparent",
  destructive: "bg-destructive/10 text-destructive border-transparent",
  neutral: "bg-secondary text-secondary-foreground border-transparent",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <Badge variant="outline" className={cn("font-semibold", toneClasses[tone])}>
      {children}
    </Badge>
  );
}
