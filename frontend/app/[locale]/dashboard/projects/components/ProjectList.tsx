"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { projectsApi } from "@/lib/api/projects";
import { clientsApi } from "@/lib/api/clients";
import { ProjectData, ClientData } from "@/lib/api/types";
import ProjectDetailsView from "./ProjectDetailsView";

export default function ProjectList() {
  const t = useTranslations("Projects");
  
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search states
  const [filterName, setFilterName] = useState("");
  const [filterClient, setFilterClient] = useState("");

  // Form states
  const [newName, setNewName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        projectsApi.getAll(),
        clientsApi.getAll()
      ]);
      setProjects(pData);
      setClients(cData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const clientId = selectedClientId === "" ? null : selectedClientId;
      await projectsApi.create({ name: newName, clientId, status: "OPEN" });
      setNewName("");
      setSelectedClientId("");
      setShowModal(false);
      await loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedByClient = useMemo(() => {
    // First, apply text filters
    const filtered = projects.filter(p => {
      const clientName = clients.find(c => c.id === p.clientId)?.name || t("noClient");
      const matchName = p.name.toLowerCase().includes(filterName.toLowerCase());
      const matchClient = clientName.toLowerCase().includes(filterClient.toLowerCase());
      return matchName && matchClient;
    });

    // Then, group by client
    const map: Record<string, { client: ClientData | null; projects: ProjectData[] }> = {};
    filtered.forEach(p => {
      const cid = p.clientId || "direct";
      if (!map[cid]) map[cid] = { client: clients.find(c => c.id === cid) || null, projects: [] };
      map[cid].projects.push(p);
    });
    return Object.values(map);
  }, [projects, clients, filterName, filterClient, t]);

  if (selectedProjectId) {
    return <ProjectDetailsView projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">{t("loading")}</div>;

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t("activeProjects")}</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">
            {t("newProjectBtn")}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
          <input type="text" placeholder={t("filterName")} className="flex-1 min-w-50 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={filterName} onChange={e => setFilterName(e.target.value)} />
          <input type="text" placeholder={t("filterClient")} className="flex-1 min-w-50 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={filterClient} onChange={e => setFilterClient(e.target.value)} />
        </div>
      </div>

      {groupedByClient.map(group => (
        <div key={group.client?.id || "direct"} className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">
              {group.client?.name || t("noClient")}
            </div>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.projects.map(project => (
              <div key={project.id} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-blue-400 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-lg text-slate-900 group-hover:text-blue-600 uppercase transition-colors">{project.name}</h3>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase">
                    {project.status}
                  </span>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-50">
                   <button onClick={() => setSelectedProjectId(project.id)} className="flex-1 bg-slate-50 text-slate-900 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all uppercase">{t("detailsBtn")}</button>
                   <button className="px-3 py-3 rounded-xl font-black text-[10px] text-red-400 hover:bg-red-50 transition-all uppercase" onClick={() => projectsApi.delete(project.id).then(loadData)}>{t("deleteBtn")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h3 className="text-3xl font-black mb-8 uppercase text-slate-900">{t("modalTitle")}</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase italic">{t("modalNameLabel")}</label>
                <input autoFocus className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold bg-slate-50 outline-none focus:border-blue-500" placeholder={t("modalNamePlaceholder")} value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase italic">{t("modalClientLabel")}</label>
                <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold outline-none focus:border-blue-500" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                  <option value="">{t("modalClientDefault")}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-400 text-xs uppercase">{t("cancelBtn")}</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 text-xs uppercase">
                  {isSubmitting ? t("creating") : t("createBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}