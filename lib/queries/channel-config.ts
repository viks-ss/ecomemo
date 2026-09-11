"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/queries/http";

export type ChannelKey = "telegram" | "discord";

export type ChannelConfigDTO = {
  id: string;
  hasToken: boolean;
  configured: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
};

function key(channel: ChannelKey) {
  return ["channel-config", channel] as const;
}

export function useChannelConfig(channel: ChannelKey) {
  return useQuery({
    queryKey: key(channel),
    queryFn: () => apiFetch<ChannelConfigDTO>(`/api/settings/${channel}`),
  });
}

export function useSaveChannelConfig(channel: ChannelKey) {
  const qc = useQueryClient();
  const idField = channel === "telegram" ? "chatId" : "channelId";
  return useMutation({
    mutationFn: (data: { botToken?: string; id: string }) =>
      apiFetch<ChannelConfigDTO>(`/api/settings/${channel}`, {
        method: "PUT",
        body: JSON.stringify({ botToken: data.botToken, [idField]: data.id }),
      }),
    onSuccess: (data) => qc.setQueryData(key(channel), data),
  });
}

export function useTestChannelConfig(channel: ChannelKey) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; message: string }>(`/api/settings/${channel}/test`, {
      method: "POST",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(channel) }),
  });
}
