import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/server/require-user";
import { getChannelConfig, saveChannelConfig, ChannelValidationError } from "@/lib/server/channel-config";

const saveSchema = z.object({
  botToken: z.string().optional(),
  channelId: z.string(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  return NextResponse.json(await getChannelConfig(userId, "discord"));
}

export async function PUT(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    await saveChannelConfig(userId, "discord", parsed.data.botToken, parsed.data.channelId);
  } catch (err) {
    if (err instanceof ChannelValidationError) {
      return NextResponse.json({ error: "invalid", message: err.message }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json(await getChannelConfig(userId, "discord"));
}
