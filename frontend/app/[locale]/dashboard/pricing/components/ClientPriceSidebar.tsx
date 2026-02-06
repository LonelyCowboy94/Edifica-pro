"use client";

import { Plus, CheckCircle2, Copy, FileText, Trash2, ChevronRight, HardHat, Loader2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ClientPriceList, ClientPriceCategory } from "@/types/prices";

interface ClientPriceSidebarProps {
  lists: ClientPriceList[];
  activeListId: number | null;
  onSelectList: (id: number) => void;
  categories: ClientPriceCategory[];
  activeCategoryId: number | null;
  onSelectCategory: (id: number, name: string) => void;
  // NOVO: Funkcija za dodavanje kategorije
  onAddCategory: (listId: number) => void; 
  onImportMaster: () => void;
  onCreateNew: () => void;
  onSetActive: (id: number) => void;
  onDelete: (id: number) => void;
  isLoadingCategories?: boolean;
}

export function ClientPriceSidebar({
  lists,
  activeListId,
  onSelectList,
  categories,
  activeCategoryId,
  onSelectCategory,
  onAddCategory, // NOVO
  onImportMaster,
  onCreateNew,
  onSetActive,
  onDelete,
  isLoadingCategories = false
}: ClientPriceSidebarProps) {
  const t = useTranslations("Prices");

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm font-sans">
      {/* 1. Header Actions */}
      <div className="p-4 bg-white border-b space-y-3">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t("create_new_list")}
        </button>
        
        <button
          onClick={onImportMaster}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-500 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          <Copy className="w-4 h-4" />
          {t("import_from_master")}
        </button>
      </div>

      {/* 2. List Registry */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">
          {t("my_registries")}
        </h3>

        {lists.map((list) => (
          <div key={list.id} className="space-y-1">
            {/* List Item Header */}
            <div
              onClick={() => onSelectList(list.id)}
              className={cn(
                "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1",
                activeListId === list.id 
                  ? "bg-white border-slate-200 shadow-sm ring-1 ring-slate-200/50" 
                  : "bg-transparent border-transparent hover:bg-slate-200/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className={cn("w-3.5 h-3.5", activeListId === list.id ? "text-indigo-600" : "text-slate-400")} />
                  <p className={cn("text-[11px] font-black uppercase tracking-tight truncate max-w-[140px]", 
                    activeListId === list.id ? "text-slate-900" : "text-slate-500")}>
                    {list.name}
                  </p>
                </div>
                {list.isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm pl-2 rounded-lg">
                {!list.isActive && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSetActive(list.id); }}
                    className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-md transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Nested Categories (Drill-down) */}
            {activeListId === list.id && (
              <div className="ml-4 pl-3 border-l-2 border-slate-200 py-1 space-y-0.5 animate-in slide-in-from-left duration-200">
                
                {/* DUGME ZA DODAVANJE NOVE KATEGORIJE UNUTAR OVOG CENOVNIKA */}
                {!isLoadingCategories && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddCategory(list.id); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-[9px] font-black text-indigo-600 hover:bg-indigo-50 transition-colors uppercase tracking-widest mb-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Dodaj kategoriju
                  </button>
                )}

                {isLoadingCategories ? (
                  <div className="flex items-center gap-2 p-2 text-[10px] text-slate-400 font-bold uppercase italic">
                    <Loader2 className="w-3 h-3 animate-spin" /> {t("loading_workspace")}
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id, cat.name)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                        activeCategoryId === cat.id 
                          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      )}
                    >
                      <HardHat className={cn("w-3 h-3", activeCategoryId === cat.id ? "text-indigo-600" : "opacity-30")} />
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight className={cn("w-2.5 h-2.5 ml-auto opacity-0 transition-opacity", activeCategoryId === cat.id && "opacity-100")} />
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-[9px] text-slate-400 font-bold uppercase italic opacity-60">
                    Nema kategorija
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}