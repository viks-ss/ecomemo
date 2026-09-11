import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// pdfjs-dist gira lato server senza Worker reale ("fake worker"): di
// default cerca di importare dinamicamente pdf.worker.mjs a runtime, ma
// quel percorso non è risolvibile dopo il bundling di Next.js/Turbopack.
// Registrandolo qui con un import statico, pdfjs-dist lo trova già pronto
// su `globalThis.pdfjsWorker` e salta l'import dinamico.
declare global {
  var pdfjsWorker: { WorkerMessageHandler: typeof WorkerMessageHandler } | undefined;
}
globalThis.pdfjsWorker = { WorkerMessageHandler };

export type PdfTextItem = {
  str: string;
  x: number;
  y: number;
};

export type PdfPageText = {
  pageNumber: number;
  width: number;
  height: number;
  items: PdfTextItem[];
};

function hasStr(item: object): item is TextItem {
  return "str" in item;
}

/** Estrae il testo posizionato (x, y) di ogni pagina di un PDF. */
export async function extractPdfPages(data: Uint8Array): Promise<PdfPageText[]> {
  const pdf = await getDocument({ data, useWorkerFetch: false }).promise;

  const pages: PdfPageText[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const items: PdfTextItem[] = content.items
      .filter(hasStr)
      .filter((item) => item.str.trim() !== "")
      .map((item) => ({
        str: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
      }));

    pages.push({ pageNumber, width: viewport.width, height: viewport.height, items });
  }

  return pages;
}

/** Ritorna solo il numero di pagine del PDF (usato per il conteggio all'upload). */
export async function countPdfPages(data: Uint8Array): Promise<number> {
  const pdf = await getDocument({ data, useWorkerFetch: false }).promise;
  return pdf.numPages;
}
