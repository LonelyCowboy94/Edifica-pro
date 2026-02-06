import { WorkerData } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { WorkerRow } from "./WorkerRow";
import { TFunction } from "../utils/worker-utils";

interface WorkerTableProps {
  workers: WorkerData[];
  loading: boolean;
  t: TFunction;
  onEdit: (worker: WorkerData) => void;
  onDelete: (id: string) => void;
}

export const WorkerTable = ({ workers, loading, t, onEdit, onDelete }: WorkerTableProps) => {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-md">
      <table className="w-full text-left border-collapse">
        <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground border-b">
          <tr>
            <th className="p-5 font-bold">{t("table.name")}</th>
            <th className="p-5 font-bold">{t("table.position")}</th>
            <th className="p-5 font-bold">{t("table.rate_account")}</th>
            <th className="p-5 font-bold">{t("table.contract")}</th>
            <th className="p-5 font-bold text-right">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={5} className="p-20 text-center">
                <Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" />
              </td>
            </tr>
          ) : workers.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium">
                {t("table.no_results")}
              </td>
            </tr>
          ) : (
            workers.map((worker) => (
              <WorkerRow 
                key={worker.id} 
                worker={worker} 
                t={t} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};