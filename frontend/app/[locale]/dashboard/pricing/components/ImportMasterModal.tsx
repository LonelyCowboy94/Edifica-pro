"use client";

import React, { useState, useEffect } from "react";
import { pricesApi } from "@/lib/api/pricesApi";
import { Country, Region, MasterPriceList } from "@/types/prices";
import { Loader2, X, Globe, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (masterListId: number, name: string) => void;
}

export function ImportMasterModal({ isOpen, onClose, onImport }: Props) {
  const t = useTranslations("Prices");
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [masterLists, setMasterLists] = useState<MasterPriceList[]>([]);

  useEffect(() => {
    if (isOpen) {
      pricesApi.getCountries().then(setCountries);
    }
  }, [isOpen]);

 const loadRegions = async (countryId: number) => {
  const data = await pricesApi.getRegions(countryId);
  setRegions(data);
  setMasterLists([]); 
};

const handleRegionSelect = async (regionId: number) => {
  setLoading(true);
  try {
    setSelectedRegionId(regionId);
    // Sada je tipizirano i dostupno
    const lists = await pricesApi.getMasterLists(regionId); 
    setMasterLists(lists);
  } catch (error) {
    console.error("Error fetching master lists", error);
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight">{t("import_title")}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">{t("select_country")}</label>
              <select 
                onChange={(e) => loadRegions(Number(e.target.value))}
                className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm appearance-none"
              >
                <option value="">{t("choose")}</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {regions.length > 0 && (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">{t("select_market")}</label>
                <div className="grid grid-cols-1 gap-2">
                  {regions.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRegionId(r.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        selectedRegionId === r.id ? "border-primary bg-primary/5 text-primary" : "border-slate-50 hover:border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="font-bold text-sm uppercase">{r.name}</span>
                      <Globe className="w-4 h-4 opacity-20" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            disabled={!selectedRegionId || loading}
            onClick={() => selectedRegionId && onImport(selectedRegionId, `Copy of ${regions.find(r => r.id === selectedRegionId)?.name}`)}
            className="w-full mt-8 bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Copy className="w-5 h-5" /> {t("confirm_import")}</>}
          </button>
        </div>
      </div>
    </div>
  );
}