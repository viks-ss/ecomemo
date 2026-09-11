import {
  LayoutDashboard,
  CalendarDays,
  UploadCloud,
  Tags,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    isActive: (p) => p === "/dashboard",
  },
  {
    href: "/calendar",
    label: "Calendario",
    icon: CalendarDays,
    isActive: (p) => p === "/calendar",
  },
  {
    href: "/pdf/upload",
    label: "Carica PDF",
    icon: UploadCloud,
    isActive: (p) => p.startsWith("/pdf"),
  },
  {
    href: "/waste-types",
    label: "Tipologie rifiuti",
    icon: Tags,
    isActive: (p) => p === "/waste-types",
  },
  {
    href: "/reminders",
    label: "Promemoria",
    icon: Bell,
    isActive: (p) => p === "/reminders",
  },
  {
    href: "/settings",
    label: "Impostazioni",
    icon: Settings,
    isActive: (p) => p.startsWith("/settings"),
  },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendario",
  "/pdf/upload": "Carica PDF",
  "/pdf/select-pages": "Seleziona le pagine",
  "/pdf/processing": "Elaborazione",
  "/waste-types": "Tipologie rifiuti",
  "/reminders": "Promemoria",
  "/settings": "Impostazioni",
  "/settings/telegram": "Telegram",
  "/settings/discord": "Discord",
};
