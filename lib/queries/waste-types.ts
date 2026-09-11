"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/queries/http";

export type WasteTypeDTO = {
  id: string;
  name: string;
  originalName: string | null;
  color: string;
  events: number;
};

const KEY = ["waste-types"] as const;

export function useWasteTypes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetch<{ wasteTypes: WasteTypeDTO[] }>("/api/waste-types").then((r) => r.wasteTypes),
  });
}

export function useCreateWasteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      apiFetch<{ wasteType: WasteTypeDTO }>("/api/waste-types", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.wasteType),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateWasteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, color }: { id: string; name: string; color: string }) =>
      apiFetch<{ wasteType: WasteTypeDTO }>(`/api/waste-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, color }),
      }).then((r) => r.wasteType),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteWasteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/waste-types/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
