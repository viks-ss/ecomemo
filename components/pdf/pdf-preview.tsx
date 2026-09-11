"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/** Carica un PDF una sola volta e ne espone le pagine come miniature. */
export function PdfPreviewDocument({
  fileUrl,
  children,
}: {
  fileUrl: string;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={() => setLoaded(true)}
      loading={
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Caricamento del PDF...
        </div>
      }
      error={
        <p className="p-8 text-center text-sm text-destructive">
          Impossibile caricare l&apos;anteprima del PDF.
        </p>
      }
    >
      {loaded ? children : null}
    </Document>
  );
}

export function PdfPageThumbnail({ pageNumber, width }: { pageNumber: number; width: number }) {
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      loading={
        <div style={{ width, height: width * 1.4 }} className="flex items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    />
  );
}
