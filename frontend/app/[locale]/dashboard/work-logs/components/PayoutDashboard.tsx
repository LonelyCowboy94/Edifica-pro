"use client";

import { useState, useEffect } from "react";
import { workLogApi, WorkLog } from "@/lib/api/workLogs";

export default function PayoutDashboard() {
  const [pending, setPending] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const load = async () => {
    setLoading(true);
    try {
      const data = await workLogApi.getPending();
      setPending(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = pending.reduce((acc, curr) => {
    const id = curr.workerId;
    if (!acc[id]) acc[id] = { name: `${curr.worker?.firstName} ${curr.worker?.lastName}`, h: 0, cash: 0 };
    const totalH = curr.regularHours + curr.overtimeHours;
    acc[id].h += totalH;
    acc[id].cash += totalH * Number(curr.hourlyRateAtTime);
    return acc;
  }, {} as Record<string, {name: string, h: number, cash: number}>);

  const settle = async (id: string) => {
    if (!confirm("Potvrdom isplate, ovi sati se arhiviraju i radnik kreće od nule. Nastaviti?")) return;
    try {
      await workLogApi.settleWorker(id);
      load();
    } catch (e) { alert("Greška pri isplati"); }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Obračunavanje u toku...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(stats).map(([id, data]) => (
        <div key={id} className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-black text-slate-800 leading-tight">{data.name}</h3>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold text-xs uppercase">Ukupno Sati</span>
                <span className="text-xl font-black text-slate-700">{data.h}h</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-xs uppercase">Iznos za isplatu</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-green-600 tracking-tighter">{data.cash.toLocaleString()}</span>
                  <span className="ml-1 text-green-600 font-bold text-sm">€</span>
                </div>
             </div>
          </div>

          <button 
            onClick={() => settle(id)}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            POTVRDI ISPLATU
          </button>
        </div>
      ))}
      {Object.keys(stats).length === 0 && (
        <div className="col-span-full bg-slate-100 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-black uppercase tracking-widest">Sve isplate su ažurne. Nema dugovanja.</p>
        </div>
      )}
    </div>
  );
}