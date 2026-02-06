import { Mail, Phone, MapPin, Edit, Trash2, Loader2 } from "lucide-react";
import { ClientData } from "@/lib/api";
import { TFunction } from "../types";

interface ClientTableProps {
  t: TFunction;
  loading: boolean;
  clients: ClientData[];
  onEdit: (client: ClientData) => void;
  onDelete: (id: string) => void;
}

export const ClientTable = ({ t, loading, clients, onEdit, onDelete }: ClientTableProps) => {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-md mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground border-b">
            <tr>
              <th className="p-5 font-bold">{t("client_name")}</th>
              <th className="p-5 font-bold">{t("contact_info")}</th>
              <th className="p-5 font-bold">{t("address")}</th>
              <th className="p-5 font-bold text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground animate-pulse">Loading clients...</p>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-muted-foreground font-medium italic">
                  {t("no_clients")}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-foreground text-base">{client.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">ID: {client.id.substring(0, 8)}</div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 text-blue-500" /> {client.email || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> {client.phone || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground italic">
                      <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                      {client.address || "N/A"}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button onClick={() => onEdit(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit className="w-4.5 h-4.5" /></button>
                      <button onClick={() => onDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};