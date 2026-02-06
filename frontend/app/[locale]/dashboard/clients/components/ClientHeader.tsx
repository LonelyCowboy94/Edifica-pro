import { Plus, Search } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { TFunction } from "../types";

interface ClientHeaderProps {
  t: TFunction;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ClientHeader = ({ t, onAdd, searchTerm, onSearchChange }: ClientHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("clients_title")}</h1>
          <p className="text-muted-foreground">{t("clients_subtitle")}</p>
        </div>
        <Button onClick={onAdd} className="gap-2 px-6 shadow-sm rounded-xl font-bold">
          <Plus className="w-4 h-4" /> {t("add_client")}
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder={t("search_clients")}
          className="w-full pl-10 pr-4 py-3 border rounded-2xl bg-card shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};