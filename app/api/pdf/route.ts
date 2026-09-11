import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/server/require-user";
import { savePdfFile } from "@/lib/server/storage";
import { countPdfPages } from "@/lib/server/pdf-text";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const doc = await prisma.pdfDocument.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });

  return NextResponse.json({ document: doc });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "missing_file", message: "Seleziona un file PDF." },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "invalid_type", message: "Il file deve essere in formato PDF." },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "too_large", message: "Il PDF è troppo grande. Carica un file più leggero." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let pageCount: number;
  try {
    pageCount = await countPdfPages(new Uint8Array(buffer));
  } catch (err) {
    console.error("[pdf-upload] countPdfPages failed:", err);
    return NextResponse.json(
      {
        error: "unreadable",
        message: "Il PDF è stato caricato, ma non sembra leggibile. Prova con un altro file.",
      },
      { status: 400 },
    );
  }

  const document = await prisma.pdfDocument.create({
    data: {
      userId,
      fileName: file.name,
      storedPath: "",
      pageCount,
      status: "UPLOADED",
    },
  });

  const storedPath = await savePdfFile(userId, document.id, buffer);

  await prisma.pdfDocument.update({ where: { id: document.id }, data: { storedPath } });
  await prisma.pdfPage.createMany({
    data: Array.from({ length: pageCount }, (_, i) => ({
      pdfDocumentId: document.id,
      pageNumber: i + 1,
      selected: true,
    })),
  });

  const withPages = await prisma.pdfDocument.findUnique({
    where: { id: document.id },
    include: { pages: { orderBy: { pageNumber: "asc" } } },
  });

  return NextResponse.json({ document: withPages }, { status: 201 });
}
