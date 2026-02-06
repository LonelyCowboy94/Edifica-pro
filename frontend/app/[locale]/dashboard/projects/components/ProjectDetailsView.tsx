"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { projectsApi } from "@/lib/api/projects";
import { ProjectDetailsResponse } from "@/lib/api/types";
import { Button } from "@/app/[locale]/components/ui/button";
import { ArrowLeft, Clock, Banknote, History, Users } from "lucide-react";

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetailsView({ projectId, onBack }: ProjectDetailsProps) {
  const t = useTranslations("ProjectDetails");
  const locale = useLocale();
  const dateLocale = locale === "sr" ? "sr-Latn-RS" : locale;

  const [data, setData] = useState<ProjectDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    projectsApi
      .getDetails(projectId)
      .then((res: ProjectDetailsResponse) => setData(res))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">
        {t("loadingAnalytics")}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 text-center font-bold text-red-500 uppercase tracking-widest">
        {t("errorLoading")}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-0 h-auto text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1 mb-2 bg-transparent"
          >
            <ArrowLeft className="w-3 h-3" /> {t("backBtn")}
          </Button>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {data.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-sm uppercase tracking-wide">
              {t("clientLabel")}:
            </span>
            <span className="text-slate-700 font-black text-sm uppercase italic">
              {data.client?.name || t("noClient")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-green-100 text-green-700 px-5 py-1.5 rounded-full text-[10px] font-black border border-green-200 uppercase tracking-widest">
            {t("statusLabel")}: {data.status}
          </span>
        </div>
      </div>

      {/* GLOBAL STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <Clock className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {t("totalHours")}
          </p>
          <p className="text-7xl font-black tracking-tighter">
            {data.analytics.totalHours}
            <span className="text-2xl text-slate-600 ml-2 italic font-medium">h</span>
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <Banknote className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
            {t("laborCost")}
          </p>
          <p className="text-7xl font-black text-slate-900 tracking-tighter">
            {data.analytics.totalCost.toLocaleString()}
            <span className="text-2xl text-slate-300 ml-3 italic font-medium uppercase">
              {data.baseCurrency}
            </span>
          </p>
        </div>
      </div>

      {/* ASSIGNED WORKERS TABLE */}
      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400" />
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">
            {t("assignedWorkers")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-100">
                <th className="p-8 font-black tracking-[0.2em]">{t("tableWorker")}</th>
                <th className="p-8 font-black tracking-[0.2em] text-center">{t("tableTotalHours")}</th>
                <th className="p-8 font-black tracking-[0.2em] text-right">{t("tableCost")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(data.analytics.workers).map(([id, worker]) => (
                <tr key={id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="p-8">
                    <div>
                      <p className="font-black text-slate-800 uppercase text-base leading-tight">
                        {worker.firstName} {worker.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-wider mt-1">
                        {worker.position}
                      </p>
                    </div>
                  </td>
                  <td className="p-8 text-center font-black text-slate-600 text-xl">
                    {worker.totalHours}h
                  </td>
                  <td className="p-8 text-right font-black text-blue-600 text-xl">
                    {worker.totalCost.toLocaleString()}
                    <span className="text-[10px] uppercase ml-2 text-slate-400 font-bold">
                      {worker.currency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORY DIARY */}
      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">
            {t("logTitle")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-100">
                <th className="p-8 font-black tracking-[0.2em]">{t("tableDate")}</th>
                <th className="p-8 font-black tracking-[0.2em]">{t("tableWorker")}</th>
                <th className="p-8 font-black tracking-[0.2em] text-center">{t("tableReg")}</th>
                <th className="p-8 font-black tracking-[0.2em] text-center">{t("tableOver")}</th>
                <th className="p-8 font-black tracking-[0.2em] text-right">{t("tableRate")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.workLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-8 text-slate-400 font-black">
                    {new Date(log.date).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="p-8 font-black text-slate-800 uppercase">
                    {log.worker?.firstName} {log.worker?.lastName}
                  </td>
                  <td className="p-8 text-center font-black text-slate-700">{log.regularHours}h</td>
                  <td className="p-8 text-center font-black text-orange-500">
                    {log.overtimeHours > 0 ? `+${log.overtimeHours}h` : "-"}
                  </td>
                  <td className="p-8 text-right font-mono font-black text-slate-400">
                    {log.hourlyRateAtTime}
                    <span className="text-[10px] ml-2 uppercase font-bold">
                      {log.worker?.currency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}