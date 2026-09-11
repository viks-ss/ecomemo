import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";

const updateSchema = z.object({
  dayBeforeEnabled: z.boolean(),
  dayBeforeTime: z.string().regex(/^\d{2}:\d{2}$/),
  sameDayEnabled: z.boolean(),
  sameDayTime: z.string().regex(/^\d{2}:\d{2}$/),
  skipEmptyDays: z.boolean(),
  messageTemplate: z.string().trim().min(1),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const settings = await prisma.reminderSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", message: "Inserisci il testo del messaggio." },
      { status: 400 },
    );
  }

  if (!parsed.data.dayBeforeEnabled && !parsed.data.sameDayEnabled) {
    return NextResponse.json(
      {
        error: "no_reminder_active",
        message: "Attiva almeno un promemoria oppure disattiva le notifiche.",
      },
      { status: 400 },
    );
  }

  const settings = await prisma.reminderSettings.upsert({
    where: { userId },
    update: parsed.data,
    create: { userId, ...parsed.data },
  });

  return NextResponse.json({ settings });
}
