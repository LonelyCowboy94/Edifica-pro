"use client";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title={t("stats.active_workers")} value="12" />
        <StatCard title={t("stats.open_projects")} value="4" />
        <StatCard title={t("stats.total_clients")} value="8" />
        <StatCard title={t("stats.last_quote")} value="2.450 €" />
      </div>
      
      {/* Ovde možemo kasnije dodati grafikon ili listu poslednjih logova iz karneta */}
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}