"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/queries/http";

export type ReminderSettingsDTO = {
  dayBeforeEnabled: boolean;
  dayBeforeTime: string;
  sameDayEnabled: boolean;
  sameDayTime: string;
  skipEmptyDays: boolean;
  messageTemplate: string;
};

const KEY = ["reminders"] as const;

export function useReminderSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetch<{ settings: ReminderSettingsDTO }>("/api/reminders").then((r) => r.settings),
  });
}

export function useSaveReminderSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReminderSettingsDTO) =>
      apiFetch<{ settings: ReminderSettingsDTO }>("/api/reminders", {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => r.settings),
    onSuccess: (settings) => qc.setQueryData(KEY, settings),
  });
}
