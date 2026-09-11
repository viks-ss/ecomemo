"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useChannelConfig } from "@/lib/queries/channel-config";

export function SettingsContent({ email }: { email: string }) {
  const { data: telegram } = useChannelConfig("telegram");
  const { data: discord } = useChannelConfig("discord");

  const handleLogout = () => {
    toast.success("Logout effettuato.");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="max-w-[640px] space-y-6">
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Notifiche</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="text-sm font-semibold text-foreground">Telegram</span>
              <StatusBadge tone={telegram?.configured ? "success" : "warning"}>
                {telegram?.configured ? "Configurato" : "Da configurare"}
              </StatusBadge>
            </div>
            <p className="mb-3 text-[13px] text-muted-foreground">
              Ricevi promemoria tramite bot Telegram.
            </p>
            <Link
              href="/settings/telegram"
              className="text-[13px] font-medium text-primary hover:text-primary/80"
            >
              Configura →
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="text-sm font-semibold text-foreground">Discord</span>
              <StatusBadge tone={discord?.configured ? "success" : "warning"}>
                {discord?.configured ? "Configurato" : "Da configurare"}
              </StatusBadge>
            </div>
            <p className="mb-3 text-[13px] text-muted-foreground">
              Ricevi promemoria in un canale Discord.
            </p>
            <Link
              href="/settings/discord"
              className="text-[13px] font-medium text-primary hover:text-primary/80"
            >
              Configura →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Istanza self-hosted</h2>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Questa istanza è self-hosted. I dati restano nell&apos;ambiente in cui hai
            installato EcoMemo. Sei responsabile della gestione e della sicurezza dei tuoi
            dati.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Account</h2>
        <div className="flex items-center justify-between rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
              <User className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground/90">{email}</span>
          </div>
          <Button
            variant="outline"
            className="hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </section>
    </div>
  );
}
