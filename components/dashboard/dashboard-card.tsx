import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "neutral";

export function DashboardCard({
  icon: Icon,
  iconClassName,
  title,
  badge,
  badgeTone,
  description,
  actionLabel,
  href,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  badge: string;
  badgeTone: Tone;
  description: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <Icon className="size-[18px]" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <StatusBadge tone={badgeTone}>{badge}</StatusBadge>
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
      >
        {actionLabel} →
      </Link>
    </div>
  );
}
