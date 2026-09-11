import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.pdfDocument.findFirst({
    where: { id, userId },
    select: { status: true, processingStep: true, errorMessage: true },
  });
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(doc);
}
