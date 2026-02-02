"use client";

import React, { useState, useEffect } from "react";
import { pricesApi } from "@/lib/api/pricesApi";
import { PriceItem } from "./types";
import {
  Save,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
} from "lucide-react";

interface PriceTableProps {
  categoryId: number;
  title: string;
}

export function PriceTable({ categoryId, title }: PriceTableProps) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const syncPriceData = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const data = await pricesApi.getItems(categoryId, page, search);
        setItems(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch price items";

        console.error("[PriceTable] Fetch Error:", msg);
      } finally {
        setIsLoading(false);
      }
    };

    syncPriceData();
  }, [categoryId, page, search]);

  const handleInputChange = (
    index: number,
    field: keyof PriceItem,
    value: string | number,
  ): void => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddNewRow = (): void => {
    const newItem: PriceItem = {
      categoryId,
      description: "",
      unit: "m2",
      price: 0,
      currency: "EUR",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = async (itemId: number): Promise<void> => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await pricesApi.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("[PriceTable] Delete Error:", err);
      alert("Failed to delete item.");
    }
  };

  const handleBulkUpdate = async (): Promise<void> => {
    setIsSaving(true);

    try {
      await pricesApi.bulkUpdateItems(items);
      const refreshedData = await pricesApi.getItems(categoryId, page, search);
      setItems(refreshedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bulk update failed";

      console.error("[PriceTable] Update Error:", msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative font-sans">
      <header className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="font-black text-slate-800 uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
            Management System • Active Category
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 w-48 transition-all"
              placeholder="SEARCH ITEMS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={handleBulkUpdate}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-black transition-all disabled:opacity-50 shadow-md active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            COMMIT CHANGES
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              <th className="p-4 font-bold text-slate-400 w-12 text-center uppercase tracking-tighter">
                #
              </th>
              <th className="p-4 font-black text-slate-700 uppercase tracking-widest">
                Work Specification
              </th>
              <th className="p-4 font-black text-slate-700 w-20 text-center uppercase tracking-widest">
                Unit
              </th>
              <th className="p-4 font-black text-slate-700 w-32 text-right uppercase tracking-widest">
                Price
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr
                key={item.id ?? `temp-${idx}`}
                className="group hover:bg-indigo-50/40 transition-colors"
              >
                <td className="p-4 text-center text-slate-300 font-mono italic">
                  {(page - 1) * 50 + idx + 1}
                </td>
                <td className="p-1">
                  <input
                    className="w-full p-2.5 bg-transparent focus:bg-white focus:ring-1 ring-indigo-300 outline-none rounded font-medium text-slate-700 border-none"
                    value={item.description}
                    onChange={(e) =>
                      handleInputChange(idx, "description", e.target.value)
                    }
                    placeholder="Describe specific task..."
                  />
                </td>
                <td className="p-1">
                  <input
                    className="w-full p-2.5 text-center bg-transparent focus:bg-white focus:ring-1 ring-indigo-300 outline-none rounded uppercase font-bold text-slate-400 border-none"
                    value={item.unit}
                    onChange={(e) =>
                      handleInputChange(idx, "unit", e.target.value)
                    }
                    placeholder="m2"
                  />
                </td>
                <td className="p-1 text-right">
                  <input
                    type="number"
                    className="w-full p-2.5 text-right bg-transparent focus:bg-white focus:ring-1 ring-indigo-300 outline-none rounded font-black text-indigo-600 border-none"
                    value={item.price}
                    onChange={(e) =>
                      handleInputChange(
                        idx,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </td>
                <td className="p-1 text-center">
                  {item.id && (
                    <button
                      onClick={() => handleDeleteItem(item.id!)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="p-4 border-t bg-slate-50 flex justify-between items-center">
        <button
          onClick={handleAddNewRow}
          disabled={isLoading}
          className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Register Entry
        </button>

        <div className="flex gap-2 items-center">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-md">
            <span className="text-[10px] font-black text-slate-500 uppercase">
              Page {page}
            </span>
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
