"use client";

import { WorkerData } from "@/lib/api";
import { 
  Mail, 
  Phone, 
  Banknote, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2,
  AlertTriangle 
} from "lucide-react";
import { formatDateDisplay, getContractPriority, TFunction } from "../utils/worker-utils";
import clsx from "clsx";

interface WorkerRowProps {
  worker: WorkerData;
  t: TFunction;
  onEdit: (worker: WorkerData) => void;
  onDelete: (id: string) => void;
}

export const WorkerRow = ({ worker, t, onEdit, onDelete }: WorkerRowProps) => {
  const priority = getContractPriority(worker);
  const formattedDate = formatDateDisplay(worker.contractUntil);
  
  const getStatusConfig = () => {
    switch (priority) {
      case 1: // EXPIRED
        return {
          classes: "text-red-700 bg-red-50 border-red-200 shadow-sm",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: t("notifications.expired", { date: formattedDate })
        };
      case 2: // URGENT (< 7 days)
        return {
          classes: "text-orange-700 bg-orange-50 border-orange-200 shadow-sm animate-pulse font-black",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: t("notifications.expiring_soon", { date: formattedDate })
        };
      case 3: // WARNING (8 - 30 days)
        return {
          classes: "text-amber-700 bg-amber-50 border-amber-200 shadow-sm",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: t("notifications.expiring_soon", { date: formattedDate })
        };
      case 4: // SAFE
      default:
        const isPermanent = worker.contractType === "permanent";
        return {
          classes: isPermanent 
            ? "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm"
            : "text-blue-700 bg-blue-50 border-blue-200 shadow-sm",
          icon: isPermanent 
            ? <ShieldCheck className="w-3.5 h-3.5" /> 
            : <Clock className="w-3.5 h-3.5 opacity-70" />,
          label: isPermanent ? t("form.permanent") : formattedDate
        };
    }
  };

  const status = getStatusConfig();

  return (
    <tr className="hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0">
      <td className="p-5">
        <div className="font-bold text-foreground text-base leading-tight">
          {worker.firstName} {worker.lastName}
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-default">
            <Mail className="w-3 h-3" /> {worker.email || t("table.no_info")}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-default">
            <Phone className="w-3 h-3" /> {worker.phone || t("table.no_info")}
          </div>
        </div>
      </td>

      <td className="p-5">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded">
          {worker.position}
        </span>
      </td>

      <td className="p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm bg-background w-fit px-3 py-1.5 rounded-xl border border-border shadow-sm">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span className="tabular-nums">{worker.hourlyRate}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black ml-0.5">
              {worker.currency}/h
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-mono ml-1">
            <CreditCard className="w-3 h-3" /> 
            {worker.bankAccount || "---"}
          </div>
        </div>
      </td>

      <td className="p-5">
        <div className={clsx(
          "flex items-center gap-2 text-[11px] font-black px-3 py-2 rounded-xl border w-fit uppercase tracking-tighter transition-all",
          status.classes
        )}>
          {status.icon} 
          {status.label}
        </div>
      </td>

      <td className="p-5 text-right">
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(worker)} 
            className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all active:scale-90"
            title={t("table.edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(worker.id)} 
            className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all active:scale-90"
            title={t("table.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};