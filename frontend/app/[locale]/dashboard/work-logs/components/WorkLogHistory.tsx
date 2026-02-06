"use client";
import { useState, useEffect } from "react";
import { workLogApi, WorkLog } from "@/lib/api/workLogs";

export default function WorkLogHistory() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await workLogApi.getAll(); // Koristi getAll metodu koju smo dodali
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Trajno obrisati ovaj unos?")) return;
    await workLogApi.delete(id);
    loadLogs();
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-300">Učitavanje arhive...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Hronološki pregled rada</h3>
        <div className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
          UKUPNO: {logs.length} zapisa
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-tighter">
            <tr>
              <th className="p-4 font-black">Datum</th>
              <th className="p-4 font-black">Radnik</th>
              <th className="p-4 font-black">Gradilište</th>
              <th className="p-4 font-black text-center">Sati</th>
              <th className="p-4 font-black text-center">Status</th>
              <th className="p-4 font-black text-right">Akcije</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {logs.map(log => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-500">{new Date(log.date).toLocaleDateString('sr-RS')}</td>
                <td className="p-4 font-black text-slate-800">{log.worker?.firstName} {log.worker?.lastName}</td>
                <td className="p-4 text-slate-600 font-medium">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      {log.project?.name}
                   </div>
                </td>
                <td className="p-4 text-center font-black">
                   <span className="text-blue-600">{log.regularHours}</span>
                   {log.overtimeHours > 0 && <span className="text-orange-500 ml-1">+{log.overtimeHours}</span>}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${log.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.status === 'SETTLED' ? 'ISPLAĆENO' : 'NA ČEKANJU'}
                  </span>
                </td>
                <td className="p-4 text-right">
                   {log.status === 'PENDING' && (
                     <div className="flex justify-end gap-3">
                        <button onClick={() => handleDelete(log.id)} className="text-red-400 hover:text-red-600 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                     </div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}