"use client";
import { useState } from "react";
import DailyWorkForm from "./components/DailyWorkForm";
import PayoutDashboard from "./components/PayoutDashboard";
import WorkLogHistory from "./components/WorkLogHistory";

export default function KarnetPage() {
  const [tab, setTab] = useState<"unos" | "isplata" | "arhiva">("unos");

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">KARNET</h1>
            <p className="text-slate-500 font-bold mt-1 text-lg">Digitalna evidencija i obračun zarada</p>
          </div>
          
          <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
            <button 
              onClick={() => setTab("unos")}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm tracking-widest transition-all ${tab === 'unos' ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              UNOS
            </button>
            <button 
              onClick={() => setTab("isplata")}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm tracking-widest transition-all ${tab === 'isplata' ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ISPLATA
            </button>
            <button 
              onClick={() => setTab("arhiva")}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm tracking-widest transition-all ${tab === 'arhiva' ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              SKLADIŠTE
            </button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tab === "unos" && <DailyWorkForm />}
          {tab === "isplata" && <PayoutDashboard />}
          {tab === "arhiva" && <WorkLogHistory />}
        </div>
      </div>
    </div>
  );
}