"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { dashboardApi } from "@/lib/api/dashboard";
import { authApi } from "@/lib/api/auth";
import { DashboardResponse, UserMeResponse } from "@/lib/api/types";
import { Button } from "../components/ui/button";
import { Users, HardHat, Wallet, PlusCircle, History, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [, setProfile] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), authApi.getMe()])
      .then(([stats, user]) => {
        setData(stats);
        setProfile(user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase">{t("loading")}</div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <p className="text-slate-400 font-bold mt-2 uppercase text-[16px] tracking-[0.2em]">
            {t("subtitle")}
          </p>
        <div>
        </div>
        <Link href={`/${locale}/dashboard/work-logs`}>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-6 py-2 h-auto font-black shadow-xl shadow-blue-100 uppercase text-[12px] tracking-widest active:scale-95">
            <PlusCircle className="w-4 h-4 mr-2" /> {t("actionNewLog")}
          </Button>
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
          <HardHat className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2 italic">{t("statProjects")}</p>
          <p className="text-6xl font-black text-slate-900 tracking-tighter">{data?.stats.activeProjects}</p>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2 italic">{t("statWorkers")}</p>
          <p className="text-6xl font-black text-slate-900 tracking-tighter">{data?.stats.totalWorkers}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 italic">{t("statDebt")}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black tracking-tighter">{data?.stats.pendingLaborCost.toLocaleString()}</p>
            <span className="text-xl font-bold text-blue-500 italic uppercase">{data?.stats.baseCurrency}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CHART SECTION - REAL ANALYTICS */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border-2 border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">{t("analyticsTitle")}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("analyticsDesc")}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><TrendingUp className="w-5 h-5" /></div>
          </div>
          
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  tickFormatter={(str: string) => str.split('-')[2]} // Show only day
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  labelClassName="font-black text-[10px] uppercase text-slate-400"
                />
                <Area type="monotone" dataKey="cost" name={t("chartCost")} stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDEBAR ACTIVITY */}
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" /> {t("recentActivity")}
            </h3>
            <Link href={`/${locale}/dashboard/work-logs`} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">
              {t("viewAll")}
            </Link>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {data?.recentLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 uppercase">
                    {log.worker?.firstName[0]}{log.worker?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-xs uppercase leading-none">{log.worker?.firstName} {log.worker?.lastName}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic mt-1 truncate max-w-30">{log.project?.name}</p>
                  </div>
                </div>
                <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  <p className="font-black text-slate-900 text-[10px]">{log.regularHours}h <span className="text-orange-500">+{log.overtimeHours}h</span></p>
                </div>
              </div>
            ))}
            {data?.recentLogs.length === 0 && <p className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("noActivity")}</p>}
          </div>

          {/* QUICK LINKS GRID */}
          <div className="p-6 bg-slate-50/50 border-t grid grid-cols-2 gap-3">
            <Link href={`/${locale}/dashboard/workers`}>
              <Button variant="outline" className="w-full rounded-2xl py-6 font-black uppercase text-[9px] tracking-widest bg-white border-slate-100 hover:border-blue-600 transition-all">
                {t("actionAddWorker")}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/projects`}>
              <Button variant="outline" className="w-full rounded-2xl py-6 font-black uppercase text-[9px] tracking-widest bg-white border-slate-100 hover:border-blue-600 transition-all">
                {t("actionNewProject")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}