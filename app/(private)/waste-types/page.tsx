"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Edit, Plus, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { WasteTypeDialog } from "@/components/waste-types/waste-type-dialog";
import { WASTE_TYPE_COLOR_OPTIONS } from "@/lib/constants";
import {
  useCreateWasteType,
  useDeleteWasteType,
  useUpdateWasteType,
  useWasteTypes,
} from "@/lib/queries/waste-types";
import { ApiError } from "@/lib/queries/http";
import { useTopbarAction } from "@/lib/topbar-action-context";

export default function WasteTypesPage() {
  const { data: wasteTypes, isLoading } = useWasteTypes();
  const createWasteType = useCreateWasteType();
  const updateWasteType = useUpdateWasteType();
  const deleteWasteType = useDeleteWasteType();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const hasAny = (wasteTypes?.length ?? 0) > 0;

  useTopbarAction(
    hasAny
      ? {
          label: "Aggiungi tipologia",
          icon: <Plus className="size-4" />,
          onClick: () => setCreateOpen(true),
        }
      : null,
    [hasAny],
  );

  if (isLoading) {
    return <Skeleton className="h-[320px] rounded-xl" />;
  }

  if ((wasteTypes?.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="Nessuna tipologia trovata"
        description="Le tipologie vengono create automaticamente dal PDF. Puoi anche aggiungerle manualmente."
        actions={
          <>
            <Button asChild>
              <Link href="/pdf/upload">Carica PDF</Link>
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              Aggiungi tipologia
            </Button>
          </>
        }
      />
    );
  }

  const types = wasteTypes ?? [];
  const editing = types.find((w) => w.id === editingId) ?? null;
  const deleting = types.find((w) => w.id === deleteId) ?? null;

  return (
    <div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        Controlla e personalizza i nomi delle tipologie estratte dal PDF.
      </p>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Colore</TableHead>
              <TableHead>Nome visualizzato</TableHead>
              <TableHead>Nome originale</TableHead>
              <TableHead className="w-20">Eventi</TableHead>
              <TableHead className="w-16 text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((wt) => (
              <TableRow key={wt.id}>
                <TableCell>
                  <span
                    className="inline-block size-5 rounded-[6px]"
                    style={{ background: wt.color }}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">{wt.name}</TableCell>
                <TableCell className="text-muted-foreground">{wt.originalName ?? "—"}</TableCell>
                <TableCell className="font-medium text-muted-foreground">{wt.events}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-primary"
                      onClick={() => setEditingId(wt.id)}
                      aria-label={`Modifica ${wt.name}`}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive disabled:opacity-40"
                            disabled={wt.events > 0}
                            onClick={() => setDeleteId(wt.id)}
                            aria-label={`Elimina ${wt.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {wt.events > 0
                          ? "Questa tipologia è usata nel calendario e non può essere eliminata."
                          : "Elimina tipologia"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <WasteTypeDialog
        key={editing?.id ?? "edit-none"}
        open={!!editing}
        onOpenChange={(open) => !open && setEditingId(null)}
        mode="edit"
        initialName={editing?.name}
        initialColor={editing?.color}
        onSubmit={async (name, color) => {
          if (!editing) return { ok: false };
          try {
            await updateWasteType.mutateAsync({ id: editing.id, name, color });
            toast.success("Tipologia aggiornata.");
            return { ok: true };
          } catch (err) {
            return { ok: false, message: err instanceof ApiError ? err.message : undefined };
          }
        }}
      />

      <WasteTypeDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        initialColor={WASTE_TYPE_COLOR_OPTIONS[0]}
        onSubmit={async (name, color) => {
          try {
            await createWasteType.mutateAsync({ name, color });
            toast.success("Tipologia creata.");
            return { ok: true };
          } catch (err) {
            return { ok: false, message: err instanceof ApiError ? err.message : undefined };
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminare tipologia?"
        description="Questa azione rimuove la tipologia personalizzata. Non potrai usarla nei promemoria."
        confirmLabel="Elimina"
        destructive
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteWasteType.mutateAsync(deleting.id);
            toast.success("Tipologia eliminata.");
          } catch (err) {
            toast.error(
              err instanceof ApiError
                ? err.message
                : "Questa tipologia è usata nel calendario e non può essere eliminata.",
            );
          }
        }}
      />
    </div>
  );
}
