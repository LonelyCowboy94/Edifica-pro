"use client";

import { useState, useEffect } from "react";
import { projectsApi } from "@/lib/api/projects";
import { ProjectDetailsResponse } from "@/lib/api";

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetailsView({ projectId, onBack }: ProjectDetailsProps) {
  const [data, setData] = useState<ProjectDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi.getDetails(projectId).then(setData).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">UČITAVANJE ANALITIKE...</div>;
  if (!data) return <div>Greška pri učitavanju podataka.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header sa akcijama */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          NAZAD NA LISTU
        </button>
        <div className="flex gap-3">
           <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest ${data.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              STATUS: {data.status}
           </span>
        </div>
      </div>

      {/* Naziv i Klijent */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{data.name}</h1>
        <p className="text-slate-500 font-bold mt-1 text-lg">Klijent: <span className="text-blue-600">{data.client?.name || "Direktni radovi"}</span></p>
      </div>

      {/* Kartice sa ukupnom statistikom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Ukupno utrošeno sati</p>
          <p className="text-5xl font-black text-slate-900">{data.analytics.totalHours}<span className="text-xl text-slate-300 ml-2">h</span></p>
        </div>
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Trošak radne snage</p>
          <p className="text-5xl font-black text-green-600">{data.analytics.totalCost.toLocaleString()}<span className="text-xl ml-2 font-bold text-green-400">€</span></p>
        </div>
      </div>

      {/* Lista radnika koji su radili na ovom projektu */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Angažovani Radnici</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase border-b">
              <th className="p-4 font-black">Radnik</th>
              <th className="p-4 font-black text-center">Ukupno Sati</th>
              <th className="p-4 font-black text-right">Trošak Zarade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
           {Object.entries(data.analytics.workers).map(([id, worker]) => (
              <tr key={id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{worker.name}</td>
                <td className="p-4 text-center font-black text-slate-600">{worker.totalHours}h</td>
                <td className="p-4 text-right font-black text-blue-600">{worker.totalCost.toLocaleString()} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hronologija rada - Svaki log pojedinačno */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Hronologija Radova (Dnevnik)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase border-b">
                <th className="p-4 font-black">Datum</th>
                <th className="p-4 font-black">Radnik</th>
                <th className="p-4 font-black text-center">Redovni</th>
                <th className="p-4 font-black text-center">Prekovremeni</th>
                <th className="p-4 font-black text-right">Satnica (snapshot)</th>
              </tr>
            </thead>
            <tbody className="text-xs">
                 {data.workLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-bold">{new Date(log.date).toLocaleDateString('sr-RS')}</td>
                  <td className="p-4 font-black text-slate-800">{log.worker?.firstName} {log.worker?.lastName}</td>
                  <td className="p-4 text-center font-bold">{log.regularHours}h</td>
                  <td className="p-4 text-center font-bold text-orange-500">{log.overtimeHours > 0 ? `+${log.overtimeHours}h` : '-'}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-400">{log.hourlyRateAtTime} €/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}