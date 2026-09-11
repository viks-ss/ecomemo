"use client";

import Link from "next/link";
import { CalendarDays, FileText, Tags, Bell, Send, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useCurrentPdf, useHasCalendarData } from "@/lib/queries/pdf";
import { useWasteTypes } from "@/lib/queries/waste-types";
import { useReminderSettings } from "@/lib/queries/reminders";
import { useChannelConfig } from "@/lib/queries/channel-config";

export default function DashboardPage() {
  const { isLoading: pdfLoading } = useCurrentPdf();
  const hasData = useHasCalendarData();
  const { data: wasteTypes } = useWasteTypes();
  const { data: reminders } = useReminderSettings();
  const { data: telegram } = useChannelConfig("telegram");
  const { data: discord } = useChannelConfig("discord");

  if (pdfLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[150px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={UploadCloud}
        title="Inizia caricando il calendario rifiuti"
        description="Carica il PDF del tuo Comune e scegli le pagine da usare per generare il calendario."
        actions={
          <Button asChild>
            <Link href="/pdf/upload">Carica PDF</Link>
          </Button>
        }
      />
    );
  }

  const remindersActive = Boolean(reminders?.dayBeforeEnabled || reminders?.sameDayEnabled);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        icon={CalendarDays}
        iconClassName="bg-accent text-primary"
        title="Calendario"
        badge="Attivo"
        badgeTone="success"
        description="Il calendario rifiuti è pronto e aggiornato."
        actionLabel="Apri calendario"
        href="/calendar"
      />
      <DashboardCard
        icon={FileText}
        iconClassName="bg-info text-info-foreground"
        title="PDF caricato"
        badge="Completato"
        badgeTone="info"
        description="Calendario rifiuti del Comune elaborato."
        actionLabel="Carica nuovo"
        href="/pdf/upload"
      />
      <DashboardCard
        icon={Tags}
        iconClassName="bg-warning text-warning-foreground"
        title="Tipologie rifiuti"
        badge={`${wasteTypes?.length ?? 0} tipologie`}
        badgeTone="warning"
        description="Tipologie estratte e personalizzabili."
        actionLabel="Gestisci"
        href="/waste-types"
      />
      <DashboardCard
        icon={Bell}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300"
        title="Promemoria"
        badge={remindersActive ? "Attivi" : "Da configurare"}
        badgeTone={remindersActive ? "success" : "warning"}
        description={remindersActive ? "Notifiche configurate." : "Configura per ricevere notifiche."}
        actionLabel="Configura"
        href="/reminders"
      />
      <DashboardCard
        icon={Send}
        iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
        title="Telegram"
        badge={telegram?.configured ? "Configurato" : "Da configurare"}
        badgeTone={telegram?.configured ? "success" : "warning"}
        description={telegram?.configured ? "Bot Telegram collegato." : "Collega il bot per ricevere notifiche."}
        actionLabel="Configura"
        href="/settings/telegram"
      />
      <DashboardCard
        icon={Send}
        iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
        title="Discord"
        badge={discord?.configured ? "Configurato" : "Da configurare"}
        badgeTone={discord?.configured ? "success" : "warning"}
        description={discord?.configured ? "Bot Discord collegato." : "Collega il bot per ricevere notifiche."}
        actionLabel="Configura"
        href="/settings/discord"
      />
    </div>
  );
}
