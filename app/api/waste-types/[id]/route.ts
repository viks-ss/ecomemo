import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";

const updateSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const wasteType = await prisma.wasteType.findFirst({ where: { id, userId } });
  if (!wasteType) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", message: "Inserisci un nome per la tipologia." },
      { status: 400 },
    );
  }

  const duplicate = await prisma.wasteType.findFirst({
    where: { userId, name: parsed.data.name, id: { not: id } },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "duplicate", message: "Esiste già una tipologia con questo nome." },
      { status: 409 },
    );
  }

  const updated = await prisma.wasteType.update({
    where: { id },
    data: { name: parsed.data.name, color: parsed.data.color },
  });

  return NextResponse.json({ wasteType: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const wasteType = await prisma.wasteType.findFirst({
    where: { id, userId },
    include: { _count: { select: { calendarEvents: true } } },
  });
  if (!wasteType) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (wasteType._count.calendarEvents > 0) {
    return NextResponse.json(
      {
        error: "in_use",
        message: "Questa tipologia è usata nel calendario e non può essere eliminata.",
      },
      { status: 409 },
    );
  }

  await prisma.wasteType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
