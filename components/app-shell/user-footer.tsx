"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserFooter({ email }: { email: string }) {
  const handleLogout = () => {
    toast.success("Logout effettuato.");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex items-center gap-2.5 border-t px-5 py-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        <User className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground/90">{email}</div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="size-[18px]" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Logout</TooltipContent>
      </Tooltip>
    </div>
  );
}
