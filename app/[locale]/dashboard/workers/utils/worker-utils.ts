import { WorkerData } from "@/lib/api";

/**
 * Type for the next-intl translation function to avoid 'any'
 */
export type TFunction = (key: string, values?: Record<string, string | number>) => string;

export const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("sr-RS", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

export const getContractPriority = (worker: WorkerData): 1 | 2 | 3 => {
  if (worker.contractType === "permanent" || !worker.contractUntil) return 3;

  const expDate = new Date(worker.contractUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1; // Expired
  if (diffDays <= 7) return 2; // Warning
  return 3; // OK
};