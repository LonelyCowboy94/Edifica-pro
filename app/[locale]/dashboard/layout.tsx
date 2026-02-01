import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import UserNav from "../components/dashboard/UserNav";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  UserSquare2,
  Wallet,
  Clock,
} from "lucide-react";
import LanguageSwitcher from "../components/shared/LanguageSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");

  const menuItems = [
    { name: t("nav.projects"), href: "/dashboard/projects", icon: Briefcase },
    { name: t("nav.workers"), href: "/dashboard/workers", icon: Users },
    { name: t("nav.clients"), href: "/dashboard/clients", icon: UserSquare2 },
    { name: t("nav.karnet"), href: "/dashboard/karnet", icon: Clock },
    { name: t("nav.pricing"), href: "/dashboard/pricing", icon: FileText },
    { name: t("nav.finances"), href: "/dashboard/finances", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link
            href="/dashboard"
            className="font-bold text-xl tracking-tighter"
          >
            EDIFICA <span className="text-primary text-xs ml-1">PRO</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary font-medium"
          >
            <LayoutDashboard className="w-5 h-5" /> {t("title")}
          </Link>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <item.icon className="w-5 h-5" /> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-8">
          <h2 className="font-semibold text-lg">{t("welcome")}, Nikola</h2>
          <div className="flex flex-nowrap gap-4 items-center">
            <LanguageSwitcher />
            <UserNav />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
