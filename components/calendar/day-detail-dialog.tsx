"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DayEvent } from "@/components/calendar/calendar-helpers";

export type DayDetail = { fullDate: string; events: DayEvent[] } | null;

export function DayDetailDialog({
  detail,
  onClose,
}: {
  detail: DayDetail;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!detail} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{detail?.fullDate}</DialogTitle>
        </DialogHeader>
        {detail && detail.events.length > 0 ? (
          <div className="flex flex-col gap-2">
            {detail.events.map((evt, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-secondary px-3.5 py-3"
              >
                <span
                  className="size-3.5 shrink-0 rounded-[4px]"
                  style={{ background: evt.color }}
                />
                <span className="text-sm font-medium text-foreground">{evt.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Per questo giorno non sono previste raccolte.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
