"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ClientPriceList, ClientPriceCategory } from "@/types/prices";
import { clientPricesApi } from "@/lib/api/clientPricesApi";
import { ClientPriceSidebar } from "./components/ClientPriceSidebar";
import { ImportMasterModal } from "./components/ImportMasterModal";
import { PriceTable } from "../admin/components/prices/PriceTable";
import { Loader2, Database } from "lucide-react";

export default function PriceListPage() {
  const t = useTranslations("Prices");
  const [lists, setLists] = useState<ClientPriceList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [activeCategories, setActiveCategories] = useState<ClientPriceCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatLoading, setIsCatLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientPricesApi.getLists();
      setLists(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectList = async (id: number) => {
    setSelectedListId(id);
    setActiveCategoryId(null);
    setIsCatLoading(true);
    try {
      const data = await clientPricesApi.getCategories(id);
      setActiveCategories(data);
    } catch (e) { console.error(e); }
    finally { setIsCatLoading(false); }
  };

  const handleCreateNew = async () => {
    const name = prompt(t("prompt_list_name"));
    if (name) {
      await clientPricesApi.createList(name);
      loadData();
    }
  };
  const handleAddCategory = async (listId: number) => {
  const name = prompt("Unesite naziv nove kategorije (npr. 'Dodatni radovi'):");
  if (name) {
    try {
      await clientPricesApi.createCategory(listId, name);
      // Osveži kategorije za trenutnu listu
      const updatedCats = await clientPricesApi.getCategories(listId);
      setActiveCategories(updatedCats);
    } catch (e) {
      console.error(e);
    }
  }
};

  const handleDeleteList = async (id: number) => {
    if (!confirm("Are you sure? This will delete all items inside.")) return;
    try {
      await clientPricesApi.deleteList(id);
      setSelectedListId(null);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleSetActive = async (id: number) => {
    await clientPricesApi.setActive(id);
    loadData();
  };

  return (
    <div className="flex flex-1 gap-6 overflow-hidden h-[calc(100vh-120px)]">
      <aside className="w-80 h-full">
        <ClientPriceSidebar 
          lists={lists}
          activeListId={selectedListId}
          onSelectList={handleSelectList}
          categories={activeCategories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id, name) => {
            setActiveCategoryId(id);
            setActiveCategoryName(name);
          }}
          onAddCategory={handleAddCategory}
          onImportMaster={() => setIsImportModalOpen(true)}
          onCreateNew={handleCreateNew}
          onSetActive={handleSetActive}
          onDelete={handleDeleteList}
          isLoadingCategories={isCatLoading}
        />
      </aside>

      <main className="flex-1 bg-white rounded-[2rem] border border-slate-200 overflow-hidden relative shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin opacity-20" /></div>
        ) : activeCategoryId ? (
          <PriceTable 
            categoryId={activeCategoryId} 
            title={activeCategoryName} 
            isReadOnly={false}
            isClient={true} // OBAVEZNO ZA KLIJENTA
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center uppercase tracking-widest font-black text-xs">
            <Database className="w-12 h-12 mb-4 opacity-10" />
            {t("select_category_hint")}
          </div>
        )}
      </main>

      <ImportMasterModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (id, name) => {
          await clientPricesApi.importMaster(id, name);
          setIsImportModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}