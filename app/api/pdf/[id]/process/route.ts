import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";
import { processPdfDocument } from "@/lib/server/pdf-processing";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.pdfDocument.findFirst({
    where: { id, userId },
    include: { pages: true },
  });
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const selectedCount = doc.pages.filter((p) => p.selected).length;
  if (selectedCount === 0) {
    return NextResponse.json(
      { error: "no_pages_selected", message: "Seleziona almeno una pagina da elaborare." },
      { status: 400 },
    );
  }

  await prisma.pdfDocument.update({
    where: { id },
    data: { status: "PROCESSING", processingStep: 0, errorMessage: null },
  });

  // Fire-and-forget: nessuna coda di job, il processo Node self-hosted
  // continua a elaborare in background mentre risponde subito al client,
  // che farà polling su GET /api/pdf/[id]/status.
  void processPdfDocument(id).catch((err) => {
    console.error("[pdf-processing] errore inatteso:", err);
  });

  return NextResponse.json({ status: "PROCESSING" }, { status: 202 });
}
