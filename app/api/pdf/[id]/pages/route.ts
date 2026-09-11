import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";

const schema = z.object({
  selectedPageNumbers: z.array(z.number().int().min(1)),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.pdfDocument.findFirst({ where: { id, userId } });
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const selected = new Set(parsed.data.selectedPageNumbers);

  await prisma.$transaction([
    prisma.pdfPage.updateMany({
      where: { pdfDocumentId: id },
      data: { selected: false },
    }),
    ...(selected.size > 0
      ? [
          prisma.pdfPage.updateMany({
            where: { pdfDocumentId: id, pageNumber: { in: Array.from(selected) } },
            data: { selected: true },
          }),
        ]
      : []),
    prisma.pdfDocument.update({
      where: { id },
      data: { status: "PAGES_SELECTED" },
    }),
  ]);

  const withPages = await prisma.pdfDocument.findUnique({
    where: { id },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });

  return NextResponse.json({ document: withPages });
}
