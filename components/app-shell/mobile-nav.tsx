"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/app-shell/logo";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { UserFooter } from "@/components/app-shell/user-footer";

export function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetHeader className="flex-row items-center gap-2.5 space-y-0 px-5 py-5">
          <Logo size={28} />
          <SheetTitle className="text-[17px] font-bold tracking-tight">EcoMemo</SheetTitle>
        </SheetHeader>
        <div className="flex h-[calc(100%-76px)] flex-col">
          <SidebarNav onNavigate={() => setOpen(false)} />
          <UserFooter email={email} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
