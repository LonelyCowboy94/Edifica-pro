import { FormEvent, Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { WorkerData } from "@/lib/api";
import { TFunction } from "../utils/worker-utils";

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  formData: Omit<WorkerData, "id">;
  setFormData: Dispatch<SetStateAction<Omit<WorkerData, "id">>>;
  editingWorker: WorkerData | null;
  t: TFunction;
}

export const WorkerModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingWorker, t }: WorkerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-border animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-black tracking-tight uppercase">
            {editingWorker ? t("modal.title_edit") : t("modal.title_new")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_firstName")}</label>
              <input 
                className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.firstName} 
                onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_lastName")}</label>
              <input 
                className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.lastName} 
                onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_position")}</label>
            <input 
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20" 
              value={formData.position} 
              onChange={e => setFormData(prev => ({...prev, position: e.target.value}))} 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_bankAccount")}</label>
            <input 
              className="w-full p-3 border rounded-xl bg-muted/30 outline-none" 
              value={formData.bankAccount} 
              onChange={e => setFormData(prev => ({...prev, bankAccount: e.target.value}))} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_email")}</label>
              <input 
                type="email" 
                className="w-full p-3 border rounded-xl bg-muted/30 outline-none" 
                value={formData.email || ""} 
                onChange={e => setFormData(prev => ({...prev, email: e.target.value}))} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_phone")}</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-xl bg-muted/30 outline-none" 
                value={formData.phone || ""} 
                onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_contractType")}</label>
              <select 
                className="w-full p-3 border rounded-xl bg-muted/30 outline-none" 
                value={formData.contractType} 
                onChange={e => setFormData(prev => ({...prev, contractType: e.target.value as "permanent" | "limited"}))}
              >
                <option value="permanent">{t("modal.option_permanent")}</option>
                <option value="limited">{t("modal.option_limited")}</option>
              </select>
            </div>
            {formData.contractType === "limited" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_contractUntil")}</label>
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl bg-muted/30 outline-none" 
                  value={formData.contractUntil || ""} 
                  onChange={e => setFormData(prev => ({...prev, contractUntil: e.target.value}))} 
                  required 
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_hourlyRate")}</label>
              <input 
                type="number" step="0.01" 
                className="w-full p-3 border rounded-xl bg-muted/30" 
                value={formData.hourlyRate} 
                onChange={e => setFormData(prev => ({...prev, hourlyRate: e.target.value}))} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t("modal.label_currency")}</label>
              <select 
                className="w-full p-3 border rounded-xl bg-muted/30" 
                value={formData.currency} 
                onChange={e => setFormData(prev => ({...prev, currency: e.target.value}))}
              >
                <option value="EUR">EUR</option>
                <option value="RSD">RSD</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 py-3 rounded-2xl" onClick={onClose}>
              {t("modal.button_cancel")}
            </Button>
            <Button type="submit" className="flex-1 py-3 rounded-2xl font-bold uppercase">
              {t("modal.button_save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};