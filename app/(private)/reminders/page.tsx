"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { useHasCalendarData } from "@/lib/queries/pdf";
import { useReminderSettings, useSaveReminderSettings, type ReminderSettingsDTO } from "@/lib/queries/reminders";
import { useWasteTypes } from "@/lib/queries/waste-types";
import { useChannelConfig } from "@/lib/queries/channel-config";
import { ApiError } from "@/lib/queries/http";

export default function RemindersPage() {
  const hasData = useHasCalendarData();
  const { data: reminders, isLoading } = useReminderSettings();

  if (isLoading) {
    return <Skeleton className="h-[500px] max-w-[640px] rounded-xl" />;
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={Bell}
        title="Genera prima il calendario"
        description="I promemoria usano i dati del calendario. Carica ed elabora un PDF prima di configurarli."
        actions={
          <Button asChild>
            <Link href="/pdf/upload">Carica PDF</Link>
          </Button>
        }
      />
    );
  }

  if (!reminders) return null;

  // key sui valori caricati: se cambiano fuori dal controllo dell'utente
  // (poco probabile qui, ma coerente con lo stesso pattern usato altrove)
  // il form riparte con lo stato corretto senza bisogno di un effect.
  return <RemindersForm reminders={reminders} />;
}

function RemindersForm({ reminders }: { reminders: ReminderSettingsDTO }) {
  const saveReminders = useSaveReminderSettings();
  const { data: wasteTypes } = useWasteTypes();
  const { data: telegram } = useChannelConfig("telegram");
  const { data: discord } = useChannelConfig("discord");

  const [dayBeforeEnabled, setDayBeforeEnabled] = useState(reminders.dayBeforeEnabled);
  const [dayBeforeTime, setDayBeforeTime] = useState(reminders.dayBeforeTime);
  const [sameDayEnabled, setSameDayEnabled] = useState(reminders.sameDayEnabled);
  const [sameDayTime, setSameDayTime] = useState(reminders.sameDayTime);
  const [skipEmptyDays, setSkipEmptyDays] = useState(reminders.skipEmptyDays);
  const [message, setMessage] = useState(reminders.messageTemplate);

  const sampleWasteTypeName = wasteTypes?.[0]?.name ?? "Plastica e lattine";
  const preview = message.includes("{tipo_rifiuto}")
    ? message.replace("{tipo_rifiuto}", sampleWasteTypeName)
    : message;

  const handleSave = () => {
    if (!message.trim()) {
      toast.error("Inserisci il testo del messaggio.");
      return;
    }
    if (!dayBeforeEnabled && !sameDayEnabled) {
      toast.error("Attiva almeno un promemoria oppure disattiva le notifiche.");
      return;
    }
    saveReminders.mutate(
      {
        dayBeforeEnabled,
        dayBeforeTime,
        sameDayEnabled,
        sameDayTime,
        skipEmptyDays,
        messageTemplate: message,
      },
      {
        onSuccess: () => toast.success("Promemoria salvati."),
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : "Impossibile salvare i promemoria. Riprova."),
      },
    );
  };

  return (
    <div className="max-w-[640px]">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Configura quando e come ricevere i promemoria sulla raccolta rifiuti.
      </p>

      <div className="mb-4 rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Promemoria il giorno prima
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ricevi un promemoria prima del giorno di raccolta.
            </p>
          </div>
          <Switch checked={dayBeforeEnabled} onCheckedChange={setDayBeforeEnabled} />
        </div>
        {dayBeforeEnabled ? (
          <div className="mt-4 flex items-center gap-2.5 border-t pt-4">
            <Label htmlFor="day-before-time" className="text-[13px] font-medium">
              Orario
            </Label>
            <Input
              id="day-before-time"
              type="time"
              value={dayBeforeTime}
              onChange={(e) => setDayBeforeTime(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
        ) : null}
      </div>

      <div className="mb-4 rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Promemoria il giorno stesso
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ricevi un promemoria il giorno della raccolta.
            </p>
          </div>
          <Switch checked={sameDayEnabled} onCheckedChange={setSameDayEnabled} />
        </div>
        {sameDayEnabled ? (
          <div className="mt-4 flex items-center gap-2.5 border-t pt-4">
            <Label htmlFor="same-day-time" className="text-[13px] font-medium">
              Orario
            </Label>
            <Input
              id="same-day-time"
              type="time"
              value={sameDayTime}
              onChange={(e) => setSameDayTime(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
        ) : null}
      </div>

      <div className="mb-4 rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Messaggi vuoti</div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Non inviare promemoria se non ci sono rifiuti da esporre.
            </p>
          </div>
          <Switch checked={skipEmptyDays} onCheckedChange={setSkipEmptyDays} />
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-card p-6">
        <div className="mb-3 text-sm font-semibold text-foreground">Messaggio del promemoria</div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px]"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Usa{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-[11px]">
            {"{tipo_rifiuto}"}
          </code>{" "}
          per inserire automaticamente i rifiuti previsti.
        </p>
        <div className="mt-3.5 rounded-lg bg-secondary p-3.5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Anteprima
          </div>
          <div className="text-sm text-foreground">{preview}</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">Canali collegati</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between rounded-lg border px-3.5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-foreground/90">Telegram</span>
              <StatusBadge tone={telegram?.configured ? "success" : "warning"}>
                {telegram?.configured ? "Configurato" : "Da configurare"}
              </StatusBadge>
            </div>
            <Link
              href="/settings/telegram"
              className="text-[13px] font-medium text-primary hover:text-primary/80"
            >
              Configura →
            </Link>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3.5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-foreground/90">Discord</span>
              <StatusBadge tone={discord?.configured ? "success" : "warning"}>
                {discord?.configured ? "Configurato" : "Da configurare"}
              </StatusBadge>
            </div>
            <Link
              href="/settings/discord"
              className="text-[13px] font-medium text-primary hover:text-primary/80"
            >
              Configura →
            </Link>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saveReminders.isPending}>
        Salva promemoria
      </Button>
    </div>
  );
}
