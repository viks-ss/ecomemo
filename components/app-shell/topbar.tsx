"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { PAGE_TITLES } from "@/components/app-shell/nav-items";
import { useTopbarActionSlot } from "@/lib/topbar-action-context";

export function Topbar({ email }: { email: string }) {
  const pathname = usePathname();
  const action = useTopbarActionSlot();
  const title = PAGE_TITLES[pathname] ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-8">
      <div className="flex items-center gap-2">
        <MobileNav email={email} />
        <h1 className="text-[18px] font-semibold text-foreground">{title}</h1>
      </div>
      {action ? (
        <Button variant={action.variant ?? "default"} size="sm" onClick={action.onClick} className="gap-2">
          {action.icon}
          {action.label}
        </Button>
      ) : null}
    </header>
  );
}
