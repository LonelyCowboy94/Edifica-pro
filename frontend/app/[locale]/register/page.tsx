"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";
import { cn } from "@/lib/utils";
import { Loader2, Check, Globe, LayoutGrid, Zap, Rocket, Building2 } from "lucide-react";

type RegisterFormData = {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tier: string;
  country: string;
};

const COUNTRY_OPTIONS = [
  { code: "DE", labelKey: "country_de" }, // Nemačka
  { code: "AT", labelKey: "country_at" }, // Austrija
  { code: "CH", labelKey: "country_ch" }, // Švajcarska
  { code: "NL", labelKey: "country_nl" }, // Holandija
  { code: "DK", labelKey: "country_dk" }, // Danska
  { code: "SE", labelKey: "country_se" }, // Švedska
  { code: "NO", labelKey: "country_no" }, // Norveška
  { code: "GB", labelKey: "country_gb" }, // Ujedinjeno Kraljevstvo
  { code: "SI", labelKey: "country_si" }, // Slovenija
  { code: "HR", labelKey: "country_hr" }, // Hrvatska
  { code: "BA", labelKey: "country_ba" }, // Bosna i Hercegovina
  { code: "ME", labelKey: "country_me" }, // Crna Gora
  { code: "RS", labelKey: "country_rs" }  // Srbija
];

const TIERS = [
  { id: "FREE", icon: LayoutGrid, price: "0€", color: "text-slate-500" },
  { id: "STANDARD", icon: Zap, price: "29€", color: "text-blue-500" },
  { id: "PRO", icon: Rocket, price: "79€", color: "text-purple-500" },
  { id: "ENTERPRISE", icon: Building2, price: "149€", color: "text-amber-500" },
];

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
    country: "RS" // Početna vrednost je sada kod
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const validateStep1 = () => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};
    if (!formData.companyName.trim()) errors.companyName = t("error_company_required");
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = t("error_email_format");
    if (formData.password.length < 6) errors.password = t("error_password_length");
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t("error_password_match");
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

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
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-background">
        <div className="w-full max-w-3xl p-8 border rounded-[2.5rem] shadow-2xl bg-card transition-all">
          
          <div className="flex items-center justify-center mb-10 gap-4">
            <div className={cn("h-2 w-16 rounded-full transition-all", step >= 1 ? "bg-primary" : "bg-muted")} />
            <div className={cn("h-2 w-16 rounded-full transition-all", step >= 2 ? "bg-primary" : "bg-muted")} />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight italic uppercase">
              {step === 1 ? t("register_title") : t("register_step2_title")}
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              {step === 1 ? t("register_subtitle") : t("register_step2_subtitle")}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold animate-shake">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase ml-1 opacity-60 tracking-widest">{t("company_name")}</label>
                  <input 
                    className={cn(
                      "w-full p-4 border rounded-2xl bg-muted/20 outline-none focus:ring-2 transition-all border-border",
                      fieldErrors.companyName ? "border-red-500 focus:ring-red-100" : "focus:ring-primary/20"
                    )}
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                  {fieldErrors.companyName && <p className="text-red-500 text-[10px] font-bold ml-2">{fieldErrors.companyName}</p>}
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase ml-1 opacity-60 tracking-widest">{t("email")}</label>
                  <input 
                    type="email"
                    className={cn(
                      "w-full p-4 border rounded-2xl bg-muted/20 outline-none focus:ring-2 transition-all border-border",
                      fieldErrors.email ? "border-red-500 focus:ring-red-100" : "focus:ring-primary/20"
                    )}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase ml-1 opacity-60 tracking-widest">{t("password")}</label>
                  <input 
                    type="password"
                    className="w-full p-4 border rounded-2xl bg-muted/20 outline-none focus:ring-2 transition-all border-border"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase ml-1 opacity-60 tracking-widest">{t("confirm_password")}</label>
                  <input 
                    type="password"
                    className="w-full p-4 border rounded-2xl bg-muted/20 outline-none focus:ring-2 transition-all border-border"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right duration-300">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60 tracking-widest">
                    <Globe className="w-4 h-4 text-primary" /> {t("register_region_label")}
                  </label>
                  <select 
                    className="w-full p-4 border rounded-2xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium cursor-pointer border-border"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  >
                
                    {COUNTRY_OPTIONS.map(c => (
                      <option key={c.code} value={c.code}>
                        {tr(c.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{t("register_tier_label")}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIERS.map((tier) => (
                      <div 
                        key={tier.id}
                        onClick={() => setFormData({...formData, tier: tier.id})}
                        className={cn(
                          "relative p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 hover:border-primary group",
                          formData.tier === tier.id ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-card"
                        )}
                      >
                        {formData.tier === tier.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5 animate-in zoom-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <tier.icon className={cn("w-8 h-8 transition-transform group-hover:scale-110", tier.color)} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{tier.id}</span>
                        <span className="text-lg font-bold">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="w-1/3 py-8 rounded-3xl font-bold uppercase text-xs tracking-widest"
                >
                  {t("button_back")}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className={cn("py-8 text-sm font-bold rounded-3xl shadow-xl transition-all flex-1 uppercase tracking-widest")}
              >
                {loading ? <Loader2 className="animate-spin" /> : (step === 1 ? t("button_next") : t("button_finish"))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}