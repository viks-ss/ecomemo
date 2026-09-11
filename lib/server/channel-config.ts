import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, sendDiscordMessage } from "@/lib/server/notifications";

export type ChannelKey = "telegram" | "discord";

export class ChannelValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const TEST_MESSAGE = "Messaggio di test da EcoMemo.";

export async function getChannelConfig(userId: string, channel: ChannelKey) {
  if (channel === "telegram") {
    const c = await prisma.telegramConfig.findUnique({ where: { userId } });
    return {
      id: c?.chatId ?? "",
      hasToken: Boolean(c?.botToken),
      configured: Boolean(c?.botToken && c?.chatId),
      lastTestAt: c?.lastTestAt ?? null,
      lastTestOk: c?.lastTestOk ?? null,
    };
  }
  const c = await prisma.discordConfig.findUnique({ where: { userId } });
  return {
    id: c?.channelId ?? "",
    hasToken: Boolean(c?.botToken),
    configured: Boolean(c?.botToken && c?.channelId),
    lastTestAt: c?.lastTestAt ?? null,
    lastTestOk: c?.lastTestOk ?? null,
  };
}

/** `botToken` vuoto/assente = mantieni il token già salvato. */
export async function saveChannelConfig(
  userId: string,
  channel: ChannelKey,
  botToken: string | undefined,
  id: string,
) {
  if (channel === "telegram") {
    const existing = await prisma.telegramConfig.findUnique({ where: { userId } });
    const tokenToSave = botToken?.trim() || existing?.botToken;
    if (!tokenToSave) throw new ChannelValidationError("Inserisci il bot token Telegram.");
    if (!id.trim()) throw new ChannelValidationError("Inserisci il chat ID Telegram.");

    return prisma.telegramConfig.upsert({
      where: { userId },
      update: { botToken: tokenToSave, chatId: id.trim() },
      create: { userId, botToken: tokenToSave, chatId: id.trim() },
    });
  }

  const existing = await prisma.discordConfig.findUnique({ where: { userId } });
  const tokenToSave = botToken?.trim() || existing?.botToken;
  if (!tokenToSave) throw new ChannelValidationError("Inserisci DISCORD_BOT_TOKEN.");
  if (!id.trim()) throw new ChannelValidationError("Inserisci DISCORD_CHANNEL_ID.");

  return prisma.discordConfig.upsert({
    where: { userId },
    update: { botToken: tokenToSave, channelId: id.trim() },
    create: { userId, botToken: tokenToSave, channelId: id.trim() },
  });
}

export async function testChannel(userId: string, channel: ChannelKey) {
  if (channel === "telegram") {
    const c = await prisma.telegramConfig.findUnique({ where: { userId } });
    if (!c?.botToken || !c?.chatId) {
      return { ok: false, error: "not_configured" as const };
    }
    const result = await sendTelegramMessage(c.botToken, c.chatId, TEST_MESSAGE);
    await prisma.telegramConfig.update({
      where: { userId },
      data: { lastTestAt: new Date(), lastTestOk: result.ok },
    });
    return result;
  }

  const c = await prisma.discordConfig.findUnique({ where: { userId } });
  if (!c?.botToken || !c?.channelId) {
    return { ok: false, error: "not_configured" as const };
  }
  const result = await sendDiscordMessage(c.botToken, c.channelId, TEST_MESSAGE);
  await prisma.discordConfig.update({
    where: { userId },
    data: { lastTestAt: new Date(), lastTestOk: result.ok },
  });
  return result;
}
