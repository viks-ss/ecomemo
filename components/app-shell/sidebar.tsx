import { Logo } from "@/components/app-shell/logo";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { UserFooter } from "@/components/app-shell/user-footer";

export function Sidebar({ email }: { email: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo size={28} />
        <span className="text-[17px] font-bold tracking-tight text-foreground">EcoMemo</span>
      </div>
      <SidebarNav />
      <UserFooter email={email} />
    </aside>
  );
}
