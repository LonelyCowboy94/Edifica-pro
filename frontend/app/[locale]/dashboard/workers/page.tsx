"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
// Importujemo API objekat i neophodan tip
import { workersApi, WorkerData } from "@/lib/api"; 
import { WorkerHeader } from "./components/WorkerHeader";
import { WorkerTable } from "./components/WorkerTable";
import { WorkerModal } from "./components/WorkerModal";
import { getContractPriority } from "./utils/worker-utils";

/**
 * WorkersPage component - Manages the state and logic for worker administration.
 */
export default function WorkersPage() {
  const t = useTranslations("Workers");
  
  // --- STATE ---
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);

  const [formData, setFormData] = useState<Omit<WorkerData, "id">>({
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    position: "",
    joinedAt: new Date().toISOString().split('T')[0],
    contractType: "permanent", 
    contractUntil: "",
    bankAccount: "", 
    hourlyRate: "", 
    currency: "EUR"
  });

  /**
   * Fetches workers using the refactored workersApi.
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // FIX: Changed from getWorkers() to workersApi.getAll()
      const data = await workersApi.getAll();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Failed to load workers:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  /**
   * Memoized filtered and sorted worker list.
   */
  const processedWorkers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    
    return workers
      .filter(w => 
        `${w.firstName} ${w.lastName}`.toLowerCase().includes(search) ||
        (w.email?.toLowerCase() || "").includes(search) ||
        w.position.toLowerCase().includes(search)
      )
      .sort((a, b) => {
        const pA = getContractPriority(a);
        const pB = getContractPriority(b);
        return pA !== pB ? pA - pB : a.firstName.localeCompare(b.firstName);
      });
  }, [workers, searchTerm]);

  /**
   * Prepares the form for editing an existing worker.
   */
  const handleEdit = (worker: WorkerData) => {
    setEditingWorker(worker);
    setFormData({ 
      ...worker, 
      email: worker.email ?? "", 
      phone: worker.phone ?? "",
      joinedAt: worker.joinedAt ? new Date(worker.joinedAt).toISOString().split('T')[0] : "",
      contractUntil: worker.contractUntil ? new Date(worker.contractUntil).toISOString().split('T')[0] : "" 
    });
    setIsModalOpen(true);
  };

  /**
   * Deletes a worker after confirmation.
   */
  const handleDelete = async (id: string) => {
    if (confirm(t("confirmDelete"))) {
      try {
        // FIX: Changed from deleteWorker(id) to workersApi.delete(id)
        await workersApi.delete(id);
        loadData();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  /**
   * Handles form submission for both creating and updating workers.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        contractUntil: formData.contractType === "permanent" ? null : formData.contractUntil 
      };

      if (editingWorker) {
        // FIX: Changed to workersApi.update
        await workersApi.update(editingWorker.id, payload);
      } else {
        // FIX: Changed to workersApi.create
        await workersApi.create(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving worker.");
    }
  };

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      <WorkerHeader 
        t={t} 
        onAdd={() => {
          setEditingWorker(null);
          setFormData({
            firstName: "", lastName: "", email: "", phone: "", position: "",
            joinedAt: new Date().toISOString().split('T')[0],
            contractType: "permanent", contractUntil: "",
            bankAccount: "", hourlyRate: "", currency: "EUR"
          });
          setIsModalOpen(true);
        }} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      <div className="bg-card border rounded-2xl overflow-hidden shadow-md">
        <WorkerTable 
          workers={processedWorkers} 
          loading={loading} 
          t={t} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <WorkerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingWorker={editingWorker}
        t={t}
      />
    </div>
  );
}