"use client";
import { useState, useEffect } from "react";
// OVO JE NOVI IMPORT:
import { getClients, addClient, updateClient, deleteClient } from "@/lib/api"; 
import { Button } from "../../components/ui/button";
import { Plus, Search, Edit, Trash2, X, Loader2, Phone, Mail, MapPin } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => { 
    loadClients(); 
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      // Provera ako backend vrati grešku ili prazno
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await addClient(formData);
      }
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
      loadClients();
    } catch (err) {
      alert("Greška pri čuvanju podataka.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Da li ste sigurni da želite da obrišete ovog klijenta?")) {
      await deleteClient(id);
      loadClients();
    }
  };

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Klijenti</h1>
          <p className="text-muted-foreground">Upravljajte listom investitora i naručioca poslova.</p>
        </div>
        <Button onClick={() => {
          setEditingClient(null);
          setFormData({ name: "", email: "", phone: "", address: "" });
          setIsModalOpen(true);
        }} className="gap-2 px-6">
          <Plus className="w-4 h-4" /> Dodaj klijenta
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Pretraži po imenu, emailu ili adresi..."
          className="w-full pl-10 pr-4 py-3 border rounded-2xl bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="p-4 font-semibold">Naziv klijenta</th>
                <th className="p-4 font-semibold">Kontakt informacije</th>
                <th className="p-4 font-semibold">Adresa</th>
                <th className="p-4 font-semibold text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-primary" /></td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-muted-foreground">Nema pronađenih klijenata.</td></tr>
              ) : filteredClients.map((client: any) => (
                <tr key={client.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-base">{client.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {client.id.substring(0,8)}</div>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-2 text-sm"><Mail className="w-3 h-3 text-muted-foreground"/> {client.email || "/"}</div>
                     <div className="flex items-center gap-2 text-sm mt-1"><Phone className="w-3 h-3 text-muted-foreground"/> {client.phone || "/"}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground mt-1 shrink-0"/>
                      <span>{client.address || "/"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setEditingClient(client);
                        setFormData(client);
                        setIsModalOpen(true);
                      }} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200 border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">{editingClient ? 'Izmeni klijenta' : 'Novi klijent'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-secondary rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Naziv klijenta *</label>
                <input 
                  className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email"
                    className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon</label>
                  <input 
                    className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresa</label>
                <textarea 
                  className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-xl" onClick={() => setIsModalOpen(false)}>Odustani</Button>
                <Button type="submit" className="flex-1 py-6 rounded-xl font-bold">Sačuvaj klijenta</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}