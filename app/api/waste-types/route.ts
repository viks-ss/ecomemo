import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";

const createSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const wasteTypes = await prisma.wasteType.findMany({
    where: { userId },
    include: { _count: { select: { calendarEvents: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    wasteTypes: wasteTypes.map((w) => ({
      id: w.id,
      name: w.name,
      originalName: w.originalName,
      color: w.color,
      events: w._count.calendarEvents,
    })),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", message: "Inserisci un nome per la tipologia." },
      { status: 400 },
    );
  }

  const existing = await prisma.wasteType.findUnique({
    where: { userId_name: { userId, name: parsed.data.name } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "duplicate", message: "Esiste già una tipologia con questo nome." },
      { status: 409 },
    );
  }

  const wasteType = await prisma.wasteType.create({
    data: { userId, name: parsed.data.name, color: parsed.data.color },
  });

  return NextResponse.json(
    { wasteType: { ...wasteType, events: 0 } },
    { status: 201 },
  );
}
