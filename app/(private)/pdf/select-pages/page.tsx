"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useCurrentPdf,
  useStartProcessing,
  useUpdateSelectedPages,
  type PdfDocumentDTO,
} from "@/lib/queries/pdf";
import { ApiError } from "@/lib/queries/http";
import { PdfPageThumbnail, PdfPreviewDocument } from "@/components/pdf/pdf-preview";

export default function SelectPagesPage() {
  const { data: doc, isLoading } = useCurrentPdf();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[210px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!doc) {
    return (
      <Alert variant="destructive" className="max-w-[560px]">
        <AlertDescription>
          Il PDF non è più disponibile.{" "}
          <Link href="/pdf/upload" className="font-medium underline underline-offset-2">
            Caricalo di nuovo
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  // key={doc.id}: monta una nuova istanza (con nuovo stato locale) ogni
  // volta che il documento cambia, senza dover sincronizzare lo stato con
  // un effect.
  return <SelectPagesForm key={doc.id} doc={doc} />;
}

function SelectPagesForm({ doc }: { doc: PdfDocumentDTO }) {
  const router = useRouter();
  const updateSelectedPages = useUpdateSelectedPages();
  const startProcessing = useStartProcessing();
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(doc.pages.filter((p) => p.selected).map((p) => p.pageNumber)),
  );

  const togglePage = (pageNumber: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(Array.from({ length: doc.pageCount }, (_, i) => i + 1)));
  const deselectAll = () => setSelected(new Set());

  const handleStart = () => {
    if (selected.size === 0) return;

    updateSelectedPages.mutate(
      { docId: doc.id, selectedPageNumbers: Array.from(selected) },
      {
        onSuccess: () => {
          startProcessing.mutate(doc.id, {
            onSuccess: () => {
              toast.success("Elaborazione avviata.");
              router.push("/pdf/processing");
            },
            onError: (err) => {
              toast.error(err instanceof ApiError ? err.message : "Elaborazione non riuscita.");
            },
          });
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Impossibile salvare le modifiche.");
        },
      },
    );
  };

  const isBusy = updateSelectedPages.isPending || startProcessing.isPending;

  return (
    <div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        Seleziona solo le pagine che vuoi usare per generare il calendario.
      </p>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-[34px]" onClick={selectAll}>
            Seleziona tutte
          </Button>
          <Button variant="outline" size="sm" className="h-[34px]" onClick={deselectAll}>
            Deseleziona tutte
          </Button>
        </div>
        <span className="text-[13px] font-medium text-muted-foreground">
          {selected.size} pagine selezionate
        </span>
      </div>

      {selected.size === 0 ? (
        <Alert className="mb-5 bg-warning text-warning-foreground [&_svg]:text-warning-foreground">
          <AlertDescription className="text-warning-foreground">
            Seleziona almeno una pagina da elaborare.
          </AlertDescription>
        </Alert>
      ) : null}

      <PdfPreviewDocument fileUrl={`/api/pdf/${doc.id}/file`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: doc.pageCount }, (_, i) => i + 1).map((pageNumber) => {
            const isSelected = selected.has(pageNumber);
            return (
              <div
                key={pageNumber}
                onClick={() => togglePage(pageNumber)}
                className={cn(
                  "cursor-pointer overflow-hidden rounded-lg border-2 bg-card transition-shadow hover:shadow-md",
                  isSelected ? "border-primary" : "border-border",
                )}
              >
                <div className={cn("relative", isSelected ? "bg-accent" : "bg-muted/40")}>
                  <PdfPageThumbnail pageNumber={pageNumber} width={200} />
                  {isSelected ? (
                    <div className="absolute right-2 top-2 flex size-[22px] items-center justify-center rounded-md bg-primary">
                      <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between border-t px-3 py-2.5">
                  <span className="text-[13px] font-medium text-foreground">Pagina {pageNumber}</span>
                  <div
                    className={cn(
                      "flex size-[18px] items-center justify-center rounded-[5px] border-2",
                      isSelected ? "border-primary bg-primary" : "border-input bg-transparent",
                    )}
                  >
                    {isSelected ? (
                      <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PdfPreviewDocument>

      <div className="sticky bottom-0 mt-6 flex items-center justify-between bg-background/95 pt-5 pb-1 backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">{selected.size} pagine selezionate</span>
        <Button onClick={handleStart} disabled={selected.size === 0 || isBusy}>
          Elabora calendario
        </Button>
      </div>
    </div>
  );
}
