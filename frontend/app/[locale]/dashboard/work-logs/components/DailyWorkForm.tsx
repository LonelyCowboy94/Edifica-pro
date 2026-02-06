"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { workersApi } from "@/lib/api/workers";
import { projectsApi } from "@/lib/api/projects";
import { workLogApi } from "@/lib/api/workLogs";
import { companyApi } from "@/lib/api/company";
import { WorkerData, ProjectData, CompanySettings } from "@/lib/api/types";
import { Check, UserPlus, Search, Users } from "lucide-react";

export default function DailyWorkForm() {
  const t = useTranslations("Karnet");
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<Record<string, { reg: number; over: number }>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Povlačimo i podešavanja firme
    Promise.all([
      workersApi.getAll(), 
      projectsApi.getAll(),
      companyApi.getSettings() 
    ]).then(([w, p, s]) => {
      setWorkers(w);
      setProjects(p);
      setSettings(s);
      applyDefaultHours(w, date, s);
    });
  }, [date]);

  // Funkcija koja određuje default sate na osnovu datuma i podešavanja
  const applyDefaultHours = (workerList: WorkerData[], selectedDate: string, companySettings: CompanySettings | null) => {
    const day = new Date(selectedDate).getDay();
    const isWeekend = day === 0 || day === 6;
    const defaultHours = companySettings 
      ? (isWeekend ? Number(companySettings.defaultWeekendHours) : Number(companySettings.defaultWeekdayHours))
      : 8;

    const initial: Record<string, { reg: number; over: number }> = {};
    workerList.forEach(worker => {
      initial[worker.id] = { reg: defaultHours, over: 0 };
    });
    setEntries(initial);
  };

  // Kada se promeni datum, resetujemo sate na nove default vrednosti
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    applyDefaultHours(workers, newDate, settings);
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workers, searchQuery]);

  const toggleWorker = (id: string) => {
    const newSet = new Set(selectedWorkerIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedWorkerIds(newSet);
  };

  const selectAllFiltered = () => {
    if (selectedWorkerIds.size === filteredWorkers.length) {
      setSelectedWorkerIds(new Set());
    } else {
      setSelectedWorkerIds(new Set(filteredWorkers.map(w => w.id)));
    }
  };

  const submitKarnet = async () => {
    if (!selectedProject) return alert(t("noProjectError"));
    const payloadEntries = Array.from(selectedWorkerIds)
      .map(id => ({
        workerId: id,
        regularHours: entries[id]?.reg || 0,
        overtimeHours: entries[id]?.over || 0
      }))
      .filter(entry => entry.regularHours > 0 || entry.overtimeHours > 0);

    if (payloadEntries.length === 0) return alert(t("noHoursError"));
    setLoading(true);
    try {
      await workLogApi.createBulk({ projectId: selectedProject, date, entries: payloadEntries });
      alert(t("success"));
      setSelectedWorkerIds(new Set());
    } catch (e) {
      console.log("Error while submiting:", e);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-62.5">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">{t("projectLabel")}</label>
          <select 
            className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">{t("projectPlaceholder")}</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">{t("dateLabel")}</label>
          <input 
            type="date" 
            className="border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:border-blue-500" 
            value={date} 
            onChange={e => handleDateChange(e.target.value)} 
          />
        </div>
      </div>

      <div className="p-4 bg-white border-b flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={selectAllFiltered}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          <Users size={18} />
          {selectedWorkerIds.size === filteredWorkers.length ? t("deselectAll") : t("selectAll")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b">
              <th className="p-6 font-black w-16">{t("tableSelect")}</th>
              <th className="p-6 font-black">{t("tableRadnik")}</th>
              <th className="p-6 font-black text-center w-40">{t("tableReg")}</th>
              <th className="p-6 font-black text-center w-40">{t("tableOver")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredWorkers.map(w => {
              const isSelected = selectedWorkerIds.has(w.id);
              return (
                <tr key={w.id} className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <td className="p-6">
                    <button 
                      onClick={() => toggleWorker(w.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {isSelected ? <Check size={20} /> : <UserPlus size={20} />}
                    </button>
                  </td>
                  <td className="p-6">
                    <p className={`font-bold transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{w.firstName} {w.lastName}</p>
                    <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-wider">{w.position}</p>
                  </td>
                  <td className="p-6">
                    <input 
                      type="number" 
                      disabled={!isSelected}
                      className="w-full text-center border-2 border-slate-100 rounded-lg p-2 font-black text-blue-600 focus:border-blue-400 outline-none disabled:opacity-30"
                      value={entries[w.id]?.reg}
                      onChange={e => setEntries(prev => ({...prev, [w.id]: {...prev[w.id], reg: Number(e.target.value)}}))}
                    />
                  </td>
                  <td className="p-6">
                    <input 
                      type="number" 
                      disabled={!isSelected}
                      className="w-full text-center border-2 border-slate-100 rounded-lg p-2 font-black text-orange-500 focus:border-orange-400 outline-none disabled:opacity-30"
                      value={entries[w.id]?.over}
                      onChange={e => setEntries(prev => ({...prev, [w.id]: {...prev[w.id], over: Number(e.target.value)}}))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
           {t("workersSelected", { count: selectedWorkerIds.size })}
        </p>
        <button 
          onClick={submitKarnet}
          disabled={loading || selectedWorkerIds.size === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black tracking-wide transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
        >
          {loading ? t("saving") : t("submitBtn")}
        </button>
      </div>
    </div>
  );
}