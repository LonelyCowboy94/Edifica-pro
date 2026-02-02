"use client";

import React, { useState, useEffect } from "react";
import { Globe, MapPin, HardHat, ChevronRight, ChevronDown, Loader2, PlusCircle, Database, Trash2 } from "lucide-react";
import { pricesApi } from "@/lib/api/pricesApi";
import { Country, Region, PriceCategory } from "./types";

interface PriceSidebarProps {
  onSelectCategory: (listId: number, categoryId: number, categoryName: string) => void;
}

export function PriceSidebar({ onSelectCategory }: PriceSidebarProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [regionsMap, setRegionsMap] = useState<Record<number, Region[]>>({});
  const [categoriesMap, setCategoriesMap] = useState<Record<number, PriceCategory[]>>({});
  
  const [expandedCountry, setExpandedCountry] = useState<number | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = await pricesApi.getCountries();
        setCountries(data);
      } catch (error) {
        console.error("[PriceSidebar] Initial fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleCountryToggle = async (countryId: number): Promise<void> => {
    if (expandedCountry === countryId) {
      setExpandedCountry(null);
      return;
    }
    setExpandedCountry(countryId);
    if (!regionsMap[countryId]) {
      try {
        const data = await pricesApi.getRegions(countryId);
        setRegionsMap(prev => ({ ...prev, [countryId]: data }));
      } catch (e) { console.error("Region load failed", e); }
    }
  };

  const handleRegionToggle = async (regionId: number): Promise<void> => {
    if (expandedRegion === regionId) {
      setExpandedRegion(null);
      return;
    }
    setExpandedRegion(regionId);
    if (!categoriesMap[regionId]) {
      try {
        const data = await pricesApi.getCategories(regionId);
        setCategoriesMap(prev => ({ ...prev, [regionId]: data }));
      } catch (e) { console.error("Category load failed", e); }
    }
  };

  // --- ACTIONS (CREATE/DELETE) ---

  const handleAddCountry = async (): Promise<void> => {
    const name = prompt("Country Name:");
    const code = prompt("Country Code (e.g. DE):");
    if (name && code) {
      const res = await pricesApi.createCountry(name, code);
      setCountries(prev => [...prev, res]);
    }
  };

  const handleDeleteCountry = async (id: number): Promise<void> => {
    if (!confirm("Delete this country and all its regions?")) return;
    await pricesApi.deleteCountry(id);
    setCountries(prev => prev.filter(c => c.id !== id));
  };

  const handleAddRegion = async (countryId: number): Promise<void> => {
    const name = prompt("Region Name:");
    if (name) {
      const res = await pricesApi.createRegion(countryId, name);
      setRegionsMap(prev => ({ ...prev, [countryId]: [...(prev[countryId] || []), res] }));
    }
  };

  const handleDeleteRegion = async (id: number, countryId: number): Promise<void> => {
    if (!confirm("Delete this region?")) return;
    await pricesApi.deleteRegion(id);
    setRegionsMap(prev => ({ ...prev, [countryId]: prev[countryId].filter(r => r.id !== id) }));
  };

  const handleAddCategory = async (regionId: number): Promise<void> => {
    const name = prompt("Category Name:");
    if (name) {
      const res = await pricesApi.createCategory(regionId, name);
      setCategoriesMap(prev => ({ ...prev, [regionId]: [...(prev[regionId] || []), res] }));
    }
  };

  const handleDeleteCategory = async (id: number, regionId: number): Promise<void> => {
    if (!confirm("Delete this category?")) return;
    await pricesApi.deleteCategory(id);
    setCategoriesMap(prev => ({ ...prev, [regionId]: prev[regionId].filter(c => c.id !== id) }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm font-sans">
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Master Records</h2>
        </div>
        <button onClick={handleAddCountry} className="text-indigo-600 hover:scale-110 transition-transform">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && countries.length === 0 ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" /></div>
        ) : (
          countries.map(country => (
            <div key={country.id} className="space-y-1">
              <div className="flex items-center group gap-1">
                <button
                  onClick={() => handleCountryToggle(country.id)}
                  className={`flex-1 flex items-center p-2.5 rounded-lg text-xs font-bold transition-all ${
                    expandedCountry === country.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Globe className={`w-3.5 h-3.5 mr-3 ${expandedCountry === country.id ? "text-indigo-200" : "text-slate-400"}`} />
                  <span className="flex-1 text-left uppercase text-[11px] tracking-tight">{country.name}</span>
                  {expandedCountry === country.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 opacity-30" />}
                </button>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleAddRegion(country.id)} className="p-1.5 text-slate-400 hover:text-indigo-600"><PlusCircle className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteCountry(country.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {expandedCountry === country.id && regionsMap[country.id]?.map(region => (
                <div key={region.id} className="ml-4 space-y-1 border-l-2 border-indigo-200 pl-2 mt-1">
                  <div className="flex items-center group gap-1">
                    <button
                      onClick={() => handleRegionToggle(region.id)}
                      className={`flex-1 flex items-center p-1.5 rounded text-[10px] font-bold ${
                        expandedRegion === region.id ? "text-indigo-700 bg-indigo-50" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <MapPin className="w-3 h-3 mr-2 opacity-60" />
                      {region.name}
                    </button>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleAddCategory(region.id)} className="p-1 text-slate-400 hover:text-indigo-600"><PlusCircle className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteRegion(region.id, country.id)} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>

                  {expandedRegion === region.id && categoriesMap[region.id]?.map(cat => (
                    <div key={cat.id} className="flex items-center group gap-1">
                      <button
                        onClick={() => onSelectCategory(region.id, cat.id, cat.name)}
                        className="flex-1 flex items-center p-2 pl-6 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                      >
                        <HardHat className="w-2.5 h-2.5 mr-2" />
                        {cat.name}
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id, region.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}