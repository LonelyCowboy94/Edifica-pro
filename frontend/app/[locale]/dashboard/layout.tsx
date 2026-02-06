"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Sidebar from "./components/Sidebar";
import UserNav from "./components/UserNav";
import LanguageSwitcher from "../components/shared/LanguageSwitcher";
import { authApi } from "@/lib/api/auth";
import { UserMeResponse } from "@/lib/api/types";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");
  const [profile, setProfile] = useState<UserMeResponse | null>(null);

  useEffect(() => {
    authApi.getMe()
      .then((data: UserMeResponse) => setProfile(data))
      .catch((err: unknown) => {
        // Safe logging without 'any'
        console.error("Profile fetch failed:", err instanceof Error ? err.message : err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8">
  <h2 className="font-black text-lg uppercase tracking-tighter text-slate-800">
    {t("welcome", { name: profile?.companyName || "..." })}
  </h2>
  <div className="flex gap-4 items-center">
    <LanguageSwitcher />
    {/* PROSLEĐUJEMO PROFILE OVDE */}
    <UserNav user={profile} />
  </div>
</header>

        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}