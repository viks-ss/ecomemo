import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";
import { readPdfFile } from "@/lib/server/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.pdfDocument.findFirst({ where: { id, userId } });
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const buffer = await readPdfFile(doc.storedPath).catch(() => null);
  if (!buffer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
