"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type TopbarAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "outline";
} | null;

const TopbarActionContext = createContext<{
  action: TopbarAction;
  setAction: (a: TopbarAction) => void;
} | null>(null);

export function TopbarActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<TopbarAction>(null);
  return (
    <TopbarActionContext.Provider value={{ action, setAction }}>
      {children}
    </TopbarActionContext.Provider>
  );
}

/** Registra l'azione contestuale della pagina corrente nella topbar condivisa. */
export function useTopbarAction(action: TopbarAction, deps: unknown[]) {
  const ctx = useContext(TopbarActionContext);
  useEffect(() => {
    ctx?.setAction(action);
    return () => ctx?.setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useTopbarActionSlot() {
  const ctx = useContext(TopbarActionContext);
  return ctx?.action ?? null;
}
