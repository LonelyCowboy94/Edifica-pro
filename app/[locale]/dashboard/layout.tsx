import { useTranslations } from "next-intl";
import Sidebar from "./components/Sidebar";
import UserNav from "./components/UserNav";
import LanguageSwitcher from "../components/shared/LanguageSwitcher";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8">
          <h2 className="font-semibold text-lg">
            {t("welcome")}, Nikola
          </h2>
          <div className="flex gap-4 items-center">
            <LanguageSwitcher />
            <UserNav />
          </div>
        </header>

        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
