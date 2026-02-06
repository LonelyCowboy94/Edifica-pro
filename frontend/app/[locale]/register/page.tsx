"use client";

import { useState, FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { Button } from "../components/ui/button"; 
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";
import { cn } from "@/lib/utils";
import { Loader2, Check, Globe, LayoutGrid, Zap, Rocket, Building2, Coins, Info } from "lucide-react";

interface RegisterFormData {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tier: string;
  country: string;
  baseCurrency: string;
}

interface CountryOption {
  code: string;
  labelKey: string;
  defaultCurrency: string;
}

interface CurrencyOption {
  code: string;
  labelKey: string;
}

const COUNTRY_MAP: CountryOption[] = [
  { code: "DE", labelKey: "country_de", defaultCurrency: "EUR" },
  { code: "AT", labelKey: "country_at", defaultCurrency: "EUR" },
  { code: "CH", labelKey: "country_ch", defaultCurrency: "CHF" },
  { code: "NL", labelKey: "country_nl", defaultCurrency: "EUR" },
  { code: "DK", labelKey: "country_dk", defaultCurrency: "DKK" },
  { code: "SE", labelKey: "country_se", defaultCurrency: "SEK" },
  { code: "NO", labelKey: "country_no", defaultCurrency: "NOK" },
  { code: "GB", labelKey: "country_gb", defaultCurrency: "GBP" },
  { code: "SI", labelKey: "country_si", defaultCurrency: "EUR" },
  { code: "HR", labelKey: "country_hr", defaultCurrency: "EUR" },
  { code: "BA", labelKey: "country_ba", defaultCurrency: "BAM" },
  { code: "ME", labelKey: "country_me", defaultCurrency: "EUR" },
  { code: "RS", labelKey: "country_rs", defaultCurrency: "RSD" }
];

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "EUR", labelKey: "currency_eur" },
  { code: "RSD", labelKey: "currency_rsd" },
  { code: "CHF", labelKey: "currency_chf" },
  { code: "BAM", labelKey: "currency_bam" },
  { code: "GBP", labelKey: "currency_gbp" },
  { code: "USD", labelKey: "currency_usd" },
  { code: "DKK", labelKey: "currency_dkk" },
  { code: "SEK", labelKey: "currency_sek" },
  { code: "NOK", labelKey: "currency_nok" },
];

const TIERS = [
  { id: "FREE", icon: LayoutGrid, price: "0€", color: "text-slate-500" },
  { id: "STANDARD", icon: Zap, price: "29€", color: "text-blue-500" },
  { id: "PRO", icon: Rocket, price: "79€", color: "text-purple-500" },
  { id: "ENTERPRISE", icon: Building2, price: "149€", color: "text-amber-500" },
] as const;

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const tr = useTranslations("Countries");
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<RegisterFormData>({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    tier: "FREE",
    country: "RS",
    baseCurrency: "RSD" 
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  useEffect(() => {
    const selected = COUNTRY_MAP.find(c => c.code === formData.country);
    if (selected) {
      setFormData(prev => ({ ...prev, baseCurrency: selected.defaultCurrency }));
    }
  }, [formData.country]);

  const validateStep1 = (): boolean => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};
    if (!formData.companyName.trim()) errors.companyName = t("error_company_required");
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = t("error_email_format");
    if (formData.password.length < 6) errors.password = t("error_password_length");
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t("error_password_match");
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...dataToSend } = formData;
      const result = await authApi.register(dataToSend);
      if (result) router.push("/login?success=registered");
    } catch (err: unknown) {
      // Zero-Any Error Handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("error_unexpected"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-slate-50/30">
        <div className="w-full max-w-3xl p-10 border rounded-[3rem] shadow-2xl bg-white animate-in fade-in zoom-in duration-300">
          
          <div className="flex items-center justify-center mb-12 gap-3">
            <div className={cn("h-1.5 w-12 rounded-full transition-all duration-500", step >= 1 ? "bg-blue-600" : "bg-slate-100")} />
            <div className={cn("h-1.5 w-12 rounded-full transition-all duration-500", step >= 2 ? "bg-blue-600" : "bg-slate-100")} />
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
              {step === 1 ? t("register_title") : t("register_step2_title")}
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-2">
              {step === 1 ? t("register_subtitle") : t("register_step2_subtitle")}
            </p>
            {error && <div className="mt-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">{error}</div>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs with strong design and type-safe error states */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t("company_name")}</label>
                  <input 
                    className={cn("w-full p-4 border-2 rounded-2xl bg-slate-50 outline-none focus:border-blue-600 transition-all font-bold", fieldErrors.companyName ? "border-red-200" : "border-slate-100")}
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t("email")}</label>
                  <input 
                    type="email"
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600 transition-all font-bold"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t("password")}</label>
                  <input 
                    type="password"
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600 transition-all font-bold"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t("confirm_password")}</label>
                  <input 
                    type="password"
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600 transition-all font-bold"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><Info className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{t("register_currency_label")}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{t("register_currency_info")}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                          <Globe className="w-3 h-3" /> {t("register_region_label")}
                        </label>
                        <select 
                          className="w-full p-4 border-2 border-white rounded-2xl bg-white shadow-sm outline-none focus:border-blue-600 font-bold cursor-pointer"
                          value={formData.country}
                          onChange={e => setFormData({...formData, country: e.target.value})}
                        >
                          {COUNTRY_MAP.map(c => <option key={c.code} value={c.code}>{tr(c.labelKey)}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                          <Coins className="w-3 h-3" /> {t("register_currency_label")}
                        </label>
                        <select 
                          className="w-full p-4 border-2 border-white rounded-2xl bg-white shadow-sm outline-none focus:border-blue-600 font-bold cursor-pointer"
                          value={formData.baseCurrency}
                          onChange={e => setFormData({...formData, baseCurrency: e.target.value})}
                        >
                          {CURRENCY_OPTIONS.map(cur => <option key={cur.code} value={cur.code}>{t(cur.labelKey)}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">{t("register_tier_label")}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TIERS.map((tier) => (
                      <div 
                        key={tier.id}
                        onClick={() => setFormData({...formData, tier: tier.id})}
                        className={cn(
                          "relative p-5 border-2 rounded-[2rem] cursor-pointer transition-all flex flex-col items-center gap-2 hover:border-blue-600 group",
                          formData.tier === tier.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 bg-white"
                        )}
                      >
                        {formData.tier === tier.id && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 animate-in zoom-in shadow-lg">
                            <Check className="w-3 h-3 text-white stroke-4" />
                          </div>
                        )}
                        <tier.icon className={cn("w-8 h-8 transition-transform group-hover:scale-110 mb-2", tier.color)} />
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">{tier.id}</span>
                        <span className="text-xl font-black text-slate-900">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              {step === 2 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]"
                >
                  {t("button_back")}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (step === 1 ? t("button_next") : t("button_finish"))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}