"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/waste-types/color-picker";
import { WASTE_TYPE_COLOR_OPTIONS } from "@/lib/constants";

export function WasteTypeDialog({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialColor = WASTE_TYPE_COLOR_OPTIONS[0],
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "edit" | "create";
  initialName?: string;
  initialColor?: string;
  onSubmit: (name: string, color: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  // Il chiamante passa una `key` legata all'elemento in modifica/creazione,
  // così ogni apertura monta una nuova istanza con questi valori iniziali
  // (evita di sincronizzare lo stato interno con un effect).
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Inserisci un nome per la tipologia.");
      return;
    }
    setSubmitting(true);
    const result = await onSubmit(name.trim(), color);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? "Esiste già una tipologia con questo nome.");
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Modifica tipologia" : "Nuova tipologia"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="wt-name">
              {mode === "edit" ? "Nome visualizzato" : "Nome tipologia"}
            </Label>
            <Input
              id="wt-name"
              value={name}
              placeholder={mode === "create" ? "es. Pannolini" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Colore</Label>
            <ColorPicker value={color} onChange={setColor} options={WASTE_TYPE_COLOR_OPTIONS} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {mode === "edit" ? "Salva" : "Crea tipologia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
