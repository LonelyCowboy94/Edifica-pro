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
  Trash2 
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
  
  // Mapping priority levels to specific UI styles and translated labels
  const statusStyles = {
    1: { 
      classes: "text-red-600 bg-red-50 border-red-200", 
      icon: <AlertCircle className="w-3 h-3" />, 
      // Koristi ključ iz prevoda i prosleđuje datum kao varijablu
      label: t("notifications.expired", { date: formattedDate }) 
    },
    2: { 
      classes: "text-amber-600 bg-amber-50 border-amber-200", 
      icon: <Clock className="w-3 h-3" />, 
      // Koristi ključ iz prevoda i prosleđuje datum kao varijablu
      label: t("notifications.expiring_soon", { date: formattedDate }) 
    },
    3: { 
      classes: worker.contractType === "permanent" 
        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
        : "text-blue-600 bg-blue-50 border-blue-100", 
      icon: worker.contractType === "permanent" 
        ? <ShieldCheck className="w-3 h-3" /> 
        : <Clock className="w-3 h-3" />, 
      label: worker.contractType === "permanent" 
        ? t("form.permanent") 
        : formattedDate 
    }
  }[priority];

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      <td className="p-5">
        <div className="font-bold text-foreground text-base leading-tight">
          {worker.firstName} {worker.lastName}
        </div>
        <div className="flex flex-col gap-1 mt-1.5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Mail className="w-3 h-3 opacity-70" /> {worker.email || t("table.no_info")}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Phone className="w-3 h-3 opacity-70" /> {worker.phone || t("table.no_info")}
          </div>
        </div>
      </td>

      <td className="p-5 text-sm font-medium text-muted-foreground uppercase tracking-tight">
        {worker.position}
      </td>

      <td className="p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm bg-secondary/40 w-fit px-3 py-1 rounded-lg border border-border/50">
            <Banknote className="w-4 h-4 text-emerald-600" />
            {worker.hourlyRate} 
            <span className="text-[10px] opacity-60 uppercase ml-0.5">{worker.currency}/h</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-1">
            <CreditCard className="w-3 h-3 opacity-70" /> 
            {worker.bankAccount}
          </div>
        </div>
      </td>

      <td className="p-5">
        <div className={clsx(
          "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border w-fit shadow-sm",
          statusStyles.classes
        )}>
          {statusStyles.icon} 
          {statusStyles.label}
        </div>
      </td>

      <td className="p-5 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => onEdit(worker)} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all active:scale-95"
            title={t("table.edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(worker.id)} 
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all active:scale-95"
            title={t("table.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};