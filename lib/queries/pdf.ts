"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/queries/http";

export type PdfPageDTO = { id: string; pageNumber: number; selected: boolean };
export type PdfDocumentStatus = "UPLOADED" | "PAGES_SELECTED" | "PROCESSING" | "PROCESSED" | "ERROR";
export type PdfDocumentDTO = {
  id: string;
  fileName: string;
  pageCount: number;
  status: PdfDocumentStatus;
  processingStep: number;
  errorMessage: string | null;
  pages: PdfPageDTO[];
};

const PDF_KEY = ["pdf"] as const;

export function useCurrentPdf() {
  return useQuery({
    queryKey: PDF_KEY,
    queryFn: () =>
      apiFetch<{ document: PdfDocumentDTO | null }>("/api/pdf").then((r) => r.document),
  });
}

/** Vero quando esiste un calendario elaborato con successo. */
export function useHasCalendarData() {
  const { data } = useCurrentPdf();
  return data?.status === "PROCESSED";
}

export function useUploadPdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<{ document: PdfDocumentDTO }>("/api/pdf", {
        method: "POST",
        body: formData,
      });
      return res.document;
    },
    onSuccess: (doc) => qc.setQueryData(PDF_KEY, doc),
  });
}

export function useUpdateSelectedPages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      docId,
      selectedPageNumbers,
    }: {
      docId: string;
      selectedPageNumbers: number[];
    }) => {
      const res = await apiFetch<{ document: PdfDocumentDTO }>(`/api/pdf/${docId}/pages`, {
        method: "PATCH",
        body: JSON.stringify({ selectedPageNumbers }),
      });
      return res.document;
    },
    onSuccess: (doc) => qc.setQueryData(PDF_KEY, doc),
  });
}

export function useStartProcessing() {
  return useMutation({
    mutationFn: (docId: string) => apiFetch(`/api/pdf/${docId}/process`, { method: "POST" }),
  });
}

export type PdfStatusDTO = {
  status: PdfDocumentStatus;
  processingStep: number;
  errorMessage: string | null;
};

export function usePdfStatus(docId: string | undefined) {
  return useQuery({
    queryKey: ["pdf-status", docId],
    queryFn: () => apiFetch<PdfStatusDTO>(`/api/pdf/${docId}/status`),
    enabled: Boolean(docId),
    refetchInterval: (query) => (query.state.data?.status === "PROCESSING" ? 800 : false),
  });
}
