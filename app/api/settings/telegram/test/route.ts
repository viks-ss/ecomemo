import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/require-user";
import { testChannel } from "@/lib/server/channel-config";

export async function POST() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await testChannel(userId, "telegram");

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.error === "not_configured"
            ? "Salva la configurazione prima di inviare un test."
            : "Test Telegram non riuscito. Verifica token e chat ID.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, message: "Messaggio Telegram inviato." });
}
