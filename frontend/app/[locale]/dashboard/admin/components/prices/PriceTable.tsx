"use client";

import React, { useState, useEffect } from "react";
import { pricesApi } from "@/lib/api/pricesApi";
import { clientPricesApi } from "@/lib/api/clientPricesApi";
import { PriceItem } from "./types";
import { ClientPriceItem } from "@/types/prices"; 
import { cn } from "@/lib/utils";
import {
  Save,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldCheck,
} from "lucide-react";

interface ExtendedPriceTableProps {
  categoryId: number;
  title: string;
  isReadOnly?: boolean;
  isClient?: boolean;
}

export function PriceTable({ categoryId, title, isReadOnly = false, isClient = false }: ExtendedPriceTableProps) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const syncPriceData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = isClient 
          ? await clientPricesApi.getItems(categoryId) 
          : await pricesApi.getItems(categoryId, page, search);
        
        setItems(data as PriceItem[]);
      } catch (err: unknown) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    syncPriceData();
  }, [categoryId, page, search, isClient]);

  const handleBulkUpdate = async (): Promise<void> => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      if (isClient) {
        await clientPricesApi.bulkUpdateItems(items as ClientPriceItem[]);
      } else {
        await pricesApi.bulkUpdateItems(items);
      }
      
      const data = isClient 
        ? await clientPricesApi.getItems(categoryId) 
        : await pricesApi.getItems(categoryId, page, search);
      setItems(data as PriceItem[]);
    } catch (err: unknown) {
      console.error("Update Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (index: number, field: keyof PriceItem, value: string | number) => {
    if (isReadOnly) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddNewRow = () => {
    if (isReadOnly) return;
    const newItem: PriceItem = { 
      categoryId, 
      description: "", 
      unit: "m2", 
      price: 0, 
      currency: "EUR" 
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = async (itemId: number): Promise<void> => {
    if (isReadOnly) return;
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await pricesApi.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: unknown) {
      console.error("[PriceTable] Delete Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans">
      <header className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="font-black text-slate-800 uppercase tracking-tight">{title}</h2>
          <div className="flex items-center gap-2 mt-1 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
             {isReadOnly ? "View Only" : isClient ? "Private Workspace Edit" : "Master Records Edit"}
             {isReadOnly && <ShieldCheck className="w-3 h-3 text-indigo-500" />}
          </div>
        </div>
        {!isReadOnly && (
          <button 
            onClick={handleBulkUpdate} 
            disabled={isSaving || isLoading} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            COMMIT CHANGES
          </button>
        )}
      </header>

      <div className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
          </div>
        )}
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              <th className="p-4 font-bold text-slate-400 w-12 text-center italic">#</th>
              <th className="p-4 font-black text-slate-700 uppercase tracking-widest text-[10px]">Work Specification</th>
              <th className="p-4 font-black text-slate-700 w-24 text-center uppercase tracking-widest text-[10px]">Unit</th>
              <th className="p-4 font-black text-slate-700 w-32 text-right uppercase tracking-widest text-[10px]">Price</th>
              {!isReadOnly && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={item.id ?? `temp-${idx}`} className="group hover:bg-indigo-50/30 transition-colors">
                <td className="p-4 text-center text-slate-300 font-mono italic">
                  {(page - 1) * 50 + idx + 1}
                </td>
                <td className="p-1">
                  <input 
                    disabled={isReadOnly} 
                    className={cn(
                      "w-full p-2.5 bg-transparent outline-none rounded font-medium text-slate-700", 
                      !isReadOnly && "focus:bg-white focus:ring-1 ring-indigo-300"
                    )} 
                    value={item.description} 
                    onChange={(e) => handleInputChange(idx, "description", e.target.value)} 
                    placeholder="Specification..."
                  />
                </td>
                <td className="p-1">
                  <input 
                    disabled={isReadOnly} 
                    className="w-full p-2.5 text-center bg-transparent outline-none font-bold text-slate-400 uppercase" 
                    value={item.unit} 
                    onChange={(e) => handleInputChange(idx, "unit", e.target.value)} 
                    placeholder="m2"
                  />
                </td>
                <td className="p-1">
                  <input 
                    disabled={isReadOnly} 
                    type="number" 
                    className="w-full p-2.5 text-right bg-transparent outline-none font-black text-indigo-600" 
                    value={item.price} 
                    onChange={(e) => handleInputChange(idx, "price", parseFloat(e.target.value) || 0)} 
                  />
                </td>
                {!isReadOnly && (
                  <td className="p-1 text-center">
                    {item.id && (
                      <button
                        onClick={() => handleDeleteItem(item.id!)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="p-4 border-t bg-slate-50 flex justify-between items-center">
        {!isReadOnly ? (
          <button 
            onClick={handleAddNewRow} 
            className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Register Entry
          </button>
        ) : (
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read Only Mode</span>
        )}

        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-md">
            <span className="text-[10px] font-black text-slate-500 uppercase">Page {page}</span>
          </div>
          <button
            disabled={isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-30 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </footer>
    </div>
  );
}