"use client";

import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { clientsApi, ClientData } from "@/lib/api";
import { ClientHeader } from "./components/ClientHeader";
import { ClientTable } from "./components/ClientTable";
import { ClientModal } from "./components/ClientModal";
import { ClientFormData } from "./types";

export default function ClientsPage() {
  const t = useTranslations("Clients");

  // --- STATE MANAGEMENT ---
  const [clients, setClients] = useState<ClientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  /**
   * Fetches the client list from the server using the modular API.
   * Wrapped in useCallback to maintain a stable reference for useEffect.
   */
  const loadClients = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // FIX: Koristimo clientsApi.getAll()
      const data = await clientsApi.getAll();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  /**
   * Prepares the form for editing an existing client record.
   */
  const handleEdit = (client: ClientData): void => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
    });
    setIsModalOpen(true);
  };

  /**
   * Permanently removes a client record after user confirmation.
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (confirm(t("confirm_delete_client"))) {
      try {
        // FIX: Koristimo clientsApi.delete()
        await clientsApi.delete(id);
        await loadClients();
      } catch (err) {
        console.error("Deletion failed:", err);
        alert(t("error_delete_client"));
      }
    }
  };

  /**
   * Handles form submission for creating or updating a client.
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingClient) {
        // FIX: Koristimo clientsApi.update()
        await clientsApi.update(editingClient.id, formData);
      } else {
        // FIX: Koristimo clientsApi.create()
        await clientsApi.create(formData);
      }
      
      closeModal();
      await loadClients();
    } catch (err) {
      console.error("Submission failed:", err);
      alert(t("error_save_client"));
    }
  };

  /**
   * Resets the modal state and clears the form data.
   */
  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
  };

  /**
   * Memoized filtered list based on the user's search input.
   */
  const filteredClients = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(search) ||
        (client.email?.toLowerCase() || "").includes(search) ||
        (client.address?.toLowerCase() || "").includes(search),
    );
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      {/* HEADER: Contains Title and Search logic */}
      <ClientHeader
        t={t}
        onAdd={() => {
          setEditingClient(null);
          setFormData({ name: "", email: "", phone: "", address: "" });
          setIsModalOpen(true);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* DATA TABLE: Renders the filtered results */}
      <ClientTable
        t={t}
        loading={loading}
        clients={filteredClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ENTRY MODAL: Contextual form for New/Edit mode */}
      <ClientModal
        t={t}
        isOpen={isModalOpen}
        isEditing={!!editingClient}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}