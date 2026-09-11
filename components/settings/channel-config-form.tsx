"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChannelConfig,
  useSaveChannelConfig,
  useTestChannelConfig,
  type ChannelConfigDTO,
  type ChannelKey,
} from "@/lib/queries/channel-config";
import { ApiError } from "@/lib/queries/http";

const CHANNEL_META: Record<
  ChannelKey,
  {
    name: string;
    description: string;
    tokenLabel: string;
    tokenHelp: string;
    tokenEmptyError: string;
    idLabel: string;
    idHelp: string;
    idEmptyError: string;
  }
> = {
  telegram: {
    name: "Telegram",
    description: "Inserisci i dati del bot Telegram che vuoi usare per ricevere i promemoria.",
    tokenLabel: "Bot Token",
    tokenHelp: "Token del bot Telegram creato dall'utente.",
    tokenEmptyError: "Inserisci il bot token Telegram.",
    idLabel: "Chat ID",
    idHelp: "ID della chat in cui inviare i promemoria.",
    idEmptyError: "Inserisci il chat ID Telegram.",
  },
  discord: {
    name: "Discord",
    description: "Inserisci i dati del bot Discord e del canale in cui vuoi ricevere i promemoria.",
    tokenLabel: "DISCORD_BOT_TOKEN",
    tokenHelp: "Token del bot Discord autorizzato a scrivere nel canale scelto.",
    tokenEmptyError: "Inserisci DISCORD_BOT_TOKEN.",
    idLabel: "DISCORD_CHANNEL_ID",
    idHelp: "ID del canale Discord in cui inviare i promemoria.",
    idEmptyError: "Inserisci DISCORD_CHANNEL_ID.",
  },
};

export function ChannelConfigForm({ channel }: { channel: ChannelKey }) {
  const { data: config, isLoading } = useChannelConfig(channel);

  if (isLoading) {
    return <Skeleton className="h-[320px] max-w-[540px] rounded-xl" />;
  }
  if (!config) return null;

  // key sull'id: se il chat/channel id salvato cambia altrove, il form
  // riparte con lo stato giusto senza dover sincronizzare con un effect.
  return <ChannelConfigFields key={config.id} channel={channel} config={config} />;
}

function ChannelConfigFields({
  channel,
  config,
}: {
  channel: ChannelKey;
  config: ChannelConfigDTO;
}) {
  const meta = CHANNEL_META[channel];
  const saveConfig = useSaveChannelConfig(channel);
  const testConfig = useTestChannelConfig(channel);

  const [botToken, setBotToken] = useState("");
  const [id, setId] = useState(config.id);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  const isComplete = (botToken.trim().length > 0 || config.hasToken) && id.trim().length > 0;

  const handleSave = () => {
    const tokenEmpty = botToken.trim().length === 0 && !config.hasToken;
    const idEmpty = !id.trim();
    setTokenError(tokenEmpty ? meta.tokenEmptyError : null);
    setIdError(idEmpty ? meta.idEmptyError : null);
    if (tokenEmpty || idEmpty) return;

    saveConfig.mutate(
      { botToken: botToken.trim() || undefined, id: id.trim() },
      {
        onSuccess: () => {
          toast.success("Configurazione salvata.");
          setBotToken("");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Impossibile salvare le modifiche.");
        },
      },
    );
  };

  const handleTest = () => {
    if (!config.configured) {
      toast.error("Salva la configurazione prima di inviare un test.");
      return;
    }
    testConfig.mutate(undefined, {
      onSuccess: (result) => {
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Test non riuscito.");
      },
    });
  };

  return (
    <div className="max-w-[540px]">
      <div className="mb-6 text-[13px]">
        <Link href="/settings" className="text-muted-foreground hover:text-primary">
          Impostazioni
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="font-medium text-foreground">{meta.name}</span>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{meta.description}</p>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-5 space-y-1.5">
          <Label htmlFor="bot-token">{meta.tokenLabel}</Label>
          <Input
            id="bot-token"
            type="password"
            placeholder={config.hasToken ? "••••••••  (lascia vuoto per non modificarlo)" : "Incolla il token qui"}
            value={botToken}
            onChange={(e) => {
              setBotToken(e.target.value);
              setTokenError(null);
            }}
          />
          {tokenError ? (
            <p className="text-xs text-destructive">{tokenError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{meta.tokenHelp}</p>
          )}
        </div>

        <div className="mb-6 space-y-1.5">
          <Label htmlFor="chat-id">{meta.idLabel}</Label>
          <Input
            id="chat-id"
            placeholder="Inserisci l'ID"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setIdError(null);
            }}
          />
          {idError ? (
            <p className="text-xs text-destructive">{idError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{meta.idHelp}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saveConfig.isPending}>
            Salva configurazione
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={!isComplete || testConfig.isPending}
            onClick={handleTest}
          >
            <Send className="size-4" />
            Invia messaggio di test
          </Button>
        </div>

        {config.lastTestOk ? (
          <p className="mt-4 text-[13px] font-medium text-success-foreground">
            Ultimo test riuscito.
          </p>
        ) : config.lastTestOk === false ? (
          <p className="mt-4 text-[13px] font-medium text-destructive">
            Ultimo test non riuscito.
          </p>
        ) : null}
      </div>
    </div>
  );
}
