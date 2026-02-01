import { X } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { ClientFormData, TFunction } from "../types";

interface ClientModalProps {
  t: TFunction;
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: ClientFormData;
  setFormData: (data: ClientFormData) => void;
}

export const ClientModal = ({ t, isOpen, isEditing, onClose, onSubmit, formData, setFormData }: ClientModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-black tracking-tight uppercase">
            {isEditing ? t("edit_client") : t("new_client")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("client_name")}</label>
            <input
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("phone")}</label>
            <input
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("address")}</label>
            <textarea
              rows={3}
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 py-3 rounded-2xl font-bold" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" className="flex-1 py-3 rounded-2xl font-bold uppercase tracking-wider">
              {t("save_client")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};