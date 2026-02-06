import { WorkerData } from "@/lib/api";

export type TFunction = (key: string, values?: Record<string, string | number>) => string;

export const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("sr-RS", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

/**
 * Priority Levels:
 * 1 - Expired (Past date)
 * 2 - Critical (0 - 7 days)
 * 3 - Warning (8 - 30 days)
 * 4 - Safe (Over 30 days or Permanent)
 */
export const getContractPriority = (worker: WorkerData): 1 | 2 | 3 | 4 => {
  if (worker.contractType === "permanent" || !worker.contractUntil) return 4;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(worker.contractUntil);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;
  if (diffDays <= 7) return 2;
  if (diffDays <= 30) return 3;
  return 4;
};