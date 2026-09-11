"use client";

import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { TopbarActionProvider } from "@/lib/topbar-action-context";

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <TopbarActionProvider>
      <div className="flex min-h-screen">
        <Sidebar email={email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar email={email} />
          <main className="flex-1 p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </TopbarActionProvider>
  );
}
