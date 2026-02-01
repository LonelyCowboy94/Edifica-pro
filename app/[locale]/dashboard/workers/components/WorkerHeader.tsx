import { Plus, Search } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { TFunction } from "../utils/worker-utils";

interface WorkerHeaderProps {
  t: TFunction;
  onAdd: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const WorkerHeader = ({ t, onAdd, searchTerm, setSearchTerm }: WorkerHeaderProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={onAdd} className="gap-2 shadow-sm px-6 py-5 rounded-xl font-bold">
          <Plus className="w-5 h-5" /> {t("addWorker")}
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full pl-12 pr-4 py-4 border rounded-2xl bg-card shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border-border"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>
    </>
  );
};