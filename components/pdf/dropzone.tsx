"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dropzone({
  onFileSelected,
  uploading,
}: {
  onFileSelected: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!uploading) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!uploading) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors",
        uploading ? "cursor-default bg-secondary/50" : "cursor-pointer bg-card",
        dragOver ? "border-primary bg-accent" : "border-border",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
        {uploading ? (
          <Loader2 className="size-7 animate-spin text-primary" />
        ) : (
          <UploadCloud className="size-7 text-muted-foreground" />
        )}
      </div>
      <p className="mt-4 text-[15px] font-medium text-foreground">
        {uploading ? "Caricamento PDF..." : "Trascina qui il PDF oppure seleziona un file"}
      </p>
      <p className="mt-1.5 text-[13px] text-muted-foreground">PDF · massimo 20 MB</p>
    </div>
  );
}
