"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { workLogApi } from "@/lib/api/workLogs";
import { WorkLog } from "@/lib/api/types";

export default function WorkLogHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  const dateLocale = locale === 'sr' ? 'sr-Latn-RS' : locale;

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // Filter states
  const [filterProject, setFilterProject] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterWorker, setFilterWorker] = useState("");
  const [filterFrom, setFilterFrom] = useState(""); // New: From Date
  const [filterTo, setFilterTo] = useState("");     // New: To Date

  const loadLogs = async () => {
    try {
      const data = await workLogApi.getAll();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const filteredAndGrouped = useMemo(() => {
    // 1. Core Filtering Logic
    const filtered = logs.filter(log => {
      const logDate = log.date.split('T')[0]; // Format: YYYY-MM-DD
      const projectName = log.project?.name || "";
      const workerPos = log.worker?.position || "";
      const workerFullName = `${log.worker?.firstName || ""} ${log.worker?.lastName || ""}`;

      // Date Range Check
      const matchFrom = filterFrom ? logDate >= filterFrom : true;
      const matchTo = filterTo ? logDate <= filterTo : true;
      
      const matchProject = projectName.toLowerCase().includes(filterProject.toLowerCase());
      const matchPosition = workerPos.toLowerCase().includes(filterPosition.toLowerCase());
      const matchWorker = workerFullName.toLowerCase().includes(filterWorker.toLowerCase());
      
      return matchFrom && matchTo && matchProject && matchPosition && matchWorker;
    });

    // 2. Nested Grouping (Month -> Day)
    const nested = filtered.reduce((acc: Record<string, Record<string, WorkLog[]>>, log) => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = date.toISOString().split('T')[0];

      if (!acc[monthKey]) acc[monthKey] = {};
      if (!acc[monthKey][dayKey]) acc[monthKey][dayKey] = [];
      
      acc[monthKey][dayKey].push(log);
      return acc;
    }, {});

    const sortedMonthKeys = Object.keys(nested).sort((a, b) => b.localeCompare(a));
    return { nested, sortedMonthKeys, totalCount: filtered.length };
  }, [logs, filterProject, filterPosition, filterWorker, filterFrom, filterTo]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">{t("loading")}</div>;

  return (
    <div className="space-y-6">
      {/* FILTER BAR - Expanded with Dates */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Text Searches */}
          <div className="flex-1 min-w-50">
            <input 
              type="text" 
              placeholder={t("filterProject")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-50">
            <input 
              type="text" 
              placeholder={t("filterWorker")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-50">
            <input 
              type="text" 
              placeholder={t("filterPosition")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
            />
          </div>
        </div>

        {/* DATE RANGE FILTERS */}
        <div className="flex flex-wrap gap-4 items-center border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("filterFrom")}</span>
             <input 
               type="date" 
               className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
               value={filterFrom}
               onChange={(e) => setFilterFrom(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("filterTo")}</span>
             <input 
               type="date" 
               className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
               value={filterTo}
               onChange={(e) => setFilterTo(e.target.value)}
             />
          </div>
          
          {/* RESET BUTTON */}
          {(filterFrom || filterTo) && (
            <button 
              onClick={() => { setFilterFrom(""); setFilterTo(""); }}
              className="text-[10px] font-bold text-red-500 hover:underline uppercase"
            >
              Poništi datume
            </button>
          )}

          <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {t("totalRecords", { count: filteredAndGrouped.totalCount })}
          </div>
        </div>
      </div>


      {/* RENDER MONTH SECTIONS */}
      {filteredAndGrouped.sortedMonthKeys.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1);
        
        // DYNAMIC DATE FORMATTING BASED ON LOCALE
        const monthLabel = monthDate.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' });
        
        const daysInMonth = filteredAndGrouped.nested[monthKey];
        const sortedDayKeys = Object.keys(daysInMonth).sort((a, b) => b.localeCompare(a));

        return (
          <div key={monthKey} className="space-y-4">
            <div className="flex items-center gap-4 px-2">
               <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">
                  {monthLabel}
               </h4>
               <div className="h-px w-full bg-slate-100"></div>
            </div>

            <div className="space-y-3">
              {sortedDayKeys.map(dayKey => {
                const dayLogs = daysInMonth[dayKey];
                const dailyTotalHours = dayLogs.reduce((sum, l) => sum + l.regularHours + l.overtimeHours, 0);
                const currentDay = new Date(dayKey);

                return (
                  <div key={dayKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleDate(dayKey)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-1 rounded-lg border-2 border-slate-200 font-black text-blue-600 shadow-sm">
                          {/* DYNAMIC DAY FORMATTING */}
                          {currentDay.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                        </div>
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                          <span>{t('workerCount', { count: dayLogs.length })}</span>
                          <span>{t('summaryDivider')}</span>
                          <span>{t('totalHoursLabel', { hours: dailyTotalHours })}</span>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedDates.includes(dayKey) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {expandedDates.includes(dayKey) && (
                      <div className="divide-y divide-slate-100 animate-in slide-in-from-top-1 duration-200">
                        {dayLogs.map(log => (
                          <div key={log.id} className="p-4 flex flex-wrap items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-10">
                              <div className="w-64">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">{t("tableWorker")}</p>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
                                    {log.worker?.firstName[0]}{log.worker?.lastName[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 leading-tight">{log.worker?.firstName} {log.worker?.lastName}</p>
                                    <p className="text-[10px] font-medium text-slate-400 italic">
                                        {log.worker?.position || t("defaultPosition")}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="w-48">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">{t("tableProject")}</p>
                                <p className="font-bold text-blue-600 truncate">{log.project?.name}</p>
                              </div>

                              <div className="w-32 text-center">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">{t("tableHours")}</p>
                                <div className="font-black text-slate-800 bg-slate-50 border border-slate-100 py-1 rounded-lg text-xs">
                                  <span className="text-blue-600">{log.regularHours}h</span>
                                  {log.overtimeHours > 0 && <span className="text-orange-500 ml-1">+{log.overtimeHours}h</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${log.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {log.status === 'SETTLED' ? t("statusSettled") : t("statusPending")}
                               </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {filteredAndGrouped.totalCount === 0 && (
        <div className="text-center p-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
          {t("empty")}
        </div>
      )}
    </div>
  );
}