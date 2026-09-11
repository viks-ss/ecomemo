import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, sendDiscordMessage } from "@/lib/server/notifications";
import type { ReminderKind } from "@prisma/client";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function currentTimeHHMM(now: Date): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** "Oggi"/"domani" nel calendario locale, normalizzati a mezzanotte UTC
 * (stesso schema usato per salvare gli eventi estratti dal PDF). */
function localCalendarDayAsUtcMidnight(now: Date, offsetDays: number): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays));
}

/**
 * Controlla, per l'orario corrente, se qualche utente ha un promemoria da
 * inviare (giorno prima o giorno stesso) ed effettua l'invio su Telegram
 * e/o Discord. Pensato per essere eseguito periodicamente (ogni minuto)
 * da un semplice timer in-process (vedi instrumentation.ts) — niente
 * coda o scheduler esterno, in linea con la semplicità richiesta per
 * un'app self-hosted.
 */
export async function runReminderCheck(now: Date = new Date()): Promise<void> {
  const hhmm = currentTimeHHMM(now);

  const dueSettings = await prisma.reminderSettings.findMany({
    where: {
      OR: [
        { dayBeforeEnabled: true, dayBeforeTime: hhmm },
        { sameDayEnabled: true, sameDayTime: hhmm },
      ],
    },
    include: {
      user: { include: { telegramConfig: true, discordConfig: true } },
    },
  });

  for (const settings of dueSettings) {
    if (settings.dayBeforeEnabled && settings.dayBeforeTime === hhmm) {
      await processReminder(settings, "DAY_BEFORE", localCalendarDayAsUtcMidnight(now, 1));
    }
    if (settings.sameDayEnabled && settings.sameDayTime === hhmm) {
      await processReminder(settings, "SAME_DAY", localCalendarDayAsUtcMidnight(now, 0));
    }
  }
}

type SettingsWithUser = Awaited<ReturnType<typeof prisma.reminderSettings.findMany>>[number] & {
  user: {
    telegramConfig: { botToken: string | null; chatId: string | null } | null;
    discordConfig: { botToken: string | null; channelId: string | null } | null;
  };
};

async function processReminder(
  settings: SettingsWithUser,
  kind: ReminderKind,
  targetDate: Date,
): Promise<void> {
  const alreadySent = await prisma.reminderLog.findUnique({
    where: { userId_date_kind: { userId: settings.userId, date: targetDate, kind } },
  });
  if (alreadySent) return;

  const events = await prisma.calendarEvent.findMany({
    where: { userId: settings.userId, date: targetDate },
    include: { wasteType: true },
  });
  const wasteTypeNames = Array.from(new Set(events.map((e) => e.wasteType.name)));

  let message: string | null;
  if (wasteTypeNames.length > 0) {
    message = settings.messageTemplate.replace("{tipo_rifiuto}", wasteTypeNames.join(", "));
  } else if (settings.skipEmptyDays) {
    message = null;
  } else {
    message =
      kind === "DAY_BEFORE"
        ? "Nessuna raccolta prevista per domani."
        : "Nessuna raccolta prevista per oggi.";
  }

  if (message) {
    const { telegramConfig, discordConfig } = settings.user;
    if (telegramConfig?.botToken && telegramConfig?.chatId) {
      await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, message);
    }
    if (discordConfig?.botToken && discordConfig?.channelId) {
      await sendDiscordMessage(discordConfig.botToken, discordConfig.channelId, message);
    }
  }

  await prisma.reminderLog.create({
    data: { userId: settings.userId, date: targetDate, kind },
  });
}
