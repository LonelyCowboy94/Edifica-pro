"use client";

import { useState, useEffect } from "react";
import { workersApi } from "@/lib/api/workers";
import { projectsApi } from "@/lib/api/projects";
import { workLogApi, WorkLogEntry } from "@/lib/api/workLogs";
import { WorkerData, ProjectData } from "@/lib/api/types";

export default function DailyWorkForm() {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<Record<string, { reg: number; over: number }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([workersApi.getAll(), projectsApi.getAll()]).then(([w, p]) => {
      setWorkers(w);
      setProjects(p);
      const initial: Record<string, { reg: number; over: number }> = {};
      w.forEach(worker => initial[worker.id] = { reg: 8, over: 0 });
      setEntries(initial);
    });
  }, []);

  const submitKarnet = async () => {
    if (!selectedProject) return alert("Molimo izaberite projekat");
    setLoading(true);
    try {
      const payloadEntries: WorkLogEntry[] = Object.entries(entries).map(([id, val]) => ({
        workerId: id,
        regularHours: val.reg,
        overtimeHours: val.over
      }));
      await workLogApi.createBulk({ projectId: selectedProject, date, entries: payloadEntries });
      alert("Karnet uspešno snimljen!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-62.5">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Gradilište / Projekat</label>
          <select 
            className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">Izaberi gradilište...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Datum Rada</label>
          <input 
            type="date" 
            className="border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:border-blue-500" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b">
              <th className="p-6 font-black">Radnik</th>
              <th className="p-6 font-black text-center w-40">Redovni Sati</th>
              <th className="p-6 font-black text-center w-40">Prekovremeni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map(w => (
              <tr key={w.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-6 font-bold text-slate-800">{w.firstName} {w.lastName}</td>
                <td className="p-6">
                  <input 
                    type="number" 
                    className="w-full text-center border-2 border-slate-100 rounded-lg p-2 font-black text-blue-600 focus:border-blue-400 outline-none"
                    value={entries[w.id]?.reg}
                    onChange={e => setEntries(prev => ({...prev, [w.id]: {...prev[w.id], reg: Number(e.target.value)}}))}
                  />
                </td>
                <td className="p-6">
                  <input 
                    type="number" 
                    className="w-full text-center border-2 border-slate-100 rounded-lg p-2 font-black text-orange-500 focus:border-orange-400 outline-none"
                    value={entries[w.id]?.over}
                    onChange={e => setEntries(prev => ({...prev, [w.id]: {...prev[w.id], over: Number(e.target.value)}}))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
        <p className="text-xs text-slate-400 font-medium italic">Podrazumevano je postavljeno 8h za sve aktivne radnike.</p>
        <button 
          onClick={submitKarnet}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black tracking-wide transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
        >
          {loading ? "ČUVANJE..." : "SNIMI KARNET ZA DANAS"}
        </button>
      </div>
    </div>
  );
}