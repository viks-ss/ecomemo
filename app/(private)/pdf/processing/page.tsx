"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Circle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROCESSING_STEPS } from "@/lib/constants";
import { useCurrentPdf, usePdfStatus } from "@/lib/queries/pdf";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function ProcessingPage() {
  const { data: doc } = useCurrentPdf();
  const { data: statusData } = usePdfStatus(doc?.id);
  const queryClient = useQueryClient();
  const hasNotifiedDone = useRef(false);

  const status = statusData?.status ?? doc?.status;
  const step = statusData?.processingStep ?? doc?.processingStep ?? 0;
  const errorMessage = statusData?.errorMessage ?? doc?.errorMessage;

  useEffect(() => {
    if (status === "PROCESSED" && !hasNotifiedDone.current) {
      hasNotifiedDone.current = true;
      toast.success("Calendario generato.");
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["waste-types"] });
      queryClient.invalidateQueries({ queryKey: ["pdf"] });
    }
  }, [status, queryClient]);

  const progressPercent = Math.round((Math.min(step, PROCESSING_STEPS.length) / PROCESSING_STEPS.length) * 100);

  if (status === "ERROR") {
    return (
      <div className="mx-auto mt-6 max-w-[500px]">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-7 text-destructive" />
          </div>
          <h2 className="mt-5 mb-2 text-xl font-semibold text-foreground">Elaborazione non riuscita</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {errorMessage ?? "Non siamo riusciti a estrarre i dati dal PDF. Puoi riprovare o caricare un altro file."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/pdf/select-pages">Riprova</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pdf/upload">Carica un altro PDF</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "PROCESSED") {
    return (
      <div className="mx-auto mt-6 max-w-[500px]">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success">
            <CheckCircle2 className="size-7 text-success-foreground" />
          </div>
          <h2 className="mt-5 mb-2 text-xl font-semibold text-foreground">Calendario generato</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Abbiamo creato il calendario e le tipologie di rifiuti trovate nel PDF.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/calendar">Apri calendario</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/waste-types">Gestisci tipologie</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-[500px]">
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto mb-5 size-12 animate-spin rounded-full border-[3px] border-secondary border-t-primary" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">Elaborazione del calendario</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Stiamo leggendo il PDF e costruendo il calendario. Potrebbe richiedere qualche minuto.
        </p>
        <Progress value={progressPercent} className="mb-7 h-1" />
        <div className="text-left">
          {PROCESSING_STEPS.map((label, i) => {
            const stepNumber = i + 1;
            const isDone = stepNumber < step;
            const isActive = stepNumber === step;
            return (
              <div key={label} className="flex items-center gap-3 border-b py-2.5 last:border-b-0">
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                ) : isActive ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0 text-border" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    isDone ? "text-primary" : isActive ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
