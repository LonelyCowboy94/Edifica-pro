"use client";

import React, { useState } from "react";
import { PriceSidebar } from "../components/prices/PricesSidebar";
import { PriceTable } from "../components/prices/PriceTable";

export default function AdminPricesPage() {
  // State for tracking what is selected in the sidebar
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("");

  const handleCategorySelect = (listId: number, catId: number, catName: string): void => {
    console.log(`[AdminPrices] Selected Category: ${catName} (ID: ${catId})`);
    setActiveCategoryId(catId);
    setActiveCategoryName(catName);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 overflow-hidden">
      {/* 1. SIDEBAR COMPONENT */}
      <aside className="w-80 h-full">
        <PriceSidebar onSelectCategory={handleCategorySelect} />
      </aside>

      {/* 2. MAIN TABLE COMPONENT */}
      <main className="flex-1 h-full">
        {activeCategoryId ? (
          <PriceTable 
            categoryId={activeCategoryId} 
            title={activeCategoryName} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider">No Category Selected</h3>
            <p className="text-slate-400 text-sm">Please select a market and category from the sidebar to edit prices.</p>
          </div>
        )}
      </main>
    </div>
  );
}