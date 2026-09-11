"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/queries/http";

export type CalendarEventDTO = {
  id: string;
  date: string;
  wasteType: { id: string; name: string; color: string };
};

export function useCalendarEvents(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return useQuery({
    queryKey: ["calendar-events", from, to],
    queryFn: () =>
      apiFetch<{ events: CalendarEventDTO[] }>(`/api/calendar-events?${params.toString()}`).then(
        (r) => r.events,
      ),
  });
}
