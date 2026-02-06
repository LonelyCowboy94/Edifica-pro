"use client";

import { useState, useEffect } from "react";
import { projectsApi } from "@/lib/api/projects";
import { clientsApi } from "@/lib/api/clients";
import { ProjectData, ClientData } from "@/lib/api/types";
import ProjectDetailsView from "./ProjectDetailsView";

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for creating a new project
  const [newName, setNewName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load projects and clients on mount
  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        projectsApi.getAll(),
        clientsApi.getAll()
      ]);
      setProjects(pData);
      setClients(cData);
    } catch (error) {
      console.error("Error loading projects/clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle new project submission
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      // Map empty string to null for the API/Database
      const clientId = selectedClientId === "" ? null : selectedClientId;

      await projectsApi.create({
        name: newName,
        clientId: clientId,
        status: "OPEN"
      });

      // Reset form and refresh list
      setNewName("");
      setSelectedClientId("");
      setShowModal(false);
      await loadData();
    } catch (error) {
      console.error("Create project failed:", error);
      alert("Greška pri kreiranju projekta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to details view if a project is selected
  if (selectedProjectId) {
    return (
      <ProjectDetailsView 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  if (loading) {
    return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Učitavanje...</div>;
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Aktivna Gradilišta</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          + NOVO GRADILIŠTE
        </button>
      </div>

      {/* PROJECTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div key={project.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-black text-xl text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{project.name}</h3>
              <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${project.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {project.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investitor / Klijent</p>
              <p className="font-bold text-slate-700">
                {clients.find(c => c.id === project.clientId)?.name || "Direktni radovi (Bez klijenta)"}
              </p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-50">
               <button 
                 onClick={() => setSelectedProjectId(project.id)}
                 className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95"
               >
                 DETALJI
               </button>
               <button 
                 className="px-4 py-4 rounded-2xl font-black text-xs text-red-400 hover:bg-red-50 transition-all"
                 onClick={() => projectsApi.delete(project.id).then(loadData)}
               >
                 OBRIŠI
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter text-slate-900">Novo Gradilište</h3>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Naziv Projekta</label>
                <input
                  autoFocus
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-blue-500 outline-none font-bold text-slate-700 bg-slate-50 transition-all"
                  placeholder="npr. Stambena zgrada - Blok 32"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Dodeli Klijenta (Opciono)</label>
                <select
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 outline-none focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none"
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                >
                  <option value="">Bez klijenta</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all tracking-widest text-xs"
                >
                  ODUSTANI
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all tracking-widest text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "SLANJE..." : "KREIRAJ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}