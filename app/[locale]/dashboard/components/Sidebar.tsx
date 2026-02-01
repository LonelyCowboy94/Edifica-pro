"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  UserSquare2,
  Wallet,
  Clock
} from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();

  // Navigation menu items configuration
  const menuItems = [
    { name: t("title"), href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: t("nav.projects"), href: "/dashboard/projects", icon: Briefcase },
    { name: t("nav.workers"), href: "/dashboard/workers", icon: Users },
    { name: t("nav.clients"), href: "/dashboard/clients", icon: UserSquare2 },
    { name: t("nav.karnet"), href: "/dashboard/karnet", icon: Clock },
    { name: t("nav.pricing"), href: "/dashboard/pricing", icon: FileText },
    { name: t("nav.finances"), href: "/dashboard/finances", icon: Wallet }
  ];

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col">
      {/* BRANDING SECTION */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="font-bold text-xl tracking-tighter">
          EDIFICA <span className="text-primary text-xs ml-1">PRO</span>
        </Link>
      </div>

      {/* NAVIGATION LINKS SECTION */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          
          const isActive = item.exact 
            ? pathname.endsWith(item.href) 
            : pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {/* ACTIVE INDICATOR (Vertical bar) */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
              )}

              <item.icon
                className={clsx(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:scale-110"
                )}
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}