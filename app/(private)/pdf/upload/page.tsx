"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dropzone } from "@/components/pdf/dropzone";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCurrentPdf, useUploadPdf } from "@/lib/queries/pdf";
import { ApiError } from "@/lib/queries/http";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export default function UploadPdfPage() {
  const router = useRouter();
  const { data: currentDoc } = useCurrentPdf();
  const uploadPdf = useUploadPdf();
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validate = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Il file deve essere in formato PDF.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "Il PDF è troppo grande. Carica un file più leggero.";
    }
    return null;
  };

  const runUpload = (file: File) => {
    setError(null);
    uploadPdf.mutate(file, {
      onSuccess: () => {
        toast.success("PDF caricato.");
        router.push("/pdf/select-pages");
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : "Impossibile caricare il PDF. Riprova.");
      },
    });
  };

  const handleFile = (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (currentDoc) {
      setPendingFile(file);
      setConfirmOpen(true);
      return;
    }

    runUpload(file);
  };

  return (
    <div className="max-w-[600px]">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Carica il calendario rifiuti fornito dal tuo Comune in formato PDF.
      </p>

      {currentDoc ? (
        <Alert className="mb-5 bg-info text-info-foreground [&_svg]:text-info-foreground">
          <FileText className="size-[18px]" />
          <AlertDescription className="text-info-foreground">
            Ultimo PDF caricato: <span className="font-medium">{currentDoc.fileName}</span>
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Dropzone onFileSelected={handleFile} uploading={uploadPdf.isPending} />

      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-primary" />
          Formato accettato: PDF
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-primary" />
          Dimensione massima: 20 MB
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-primary" />
          Un solo file alla volta
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sostituire il calendario?"
        description="Il nuovo PDF potrà aggiornare eventi, pagine selezionate e tipologie rifiuti. I promemoria resteranno configurati."
        confirmLabel="Sostituisci PDF"
        onConfirm={() => {
          if (pendingFile) runUpload(pendingFile);
        }}
      />
    </div>
  );
}
