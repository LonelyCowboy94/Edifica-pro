"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email.trim()) {
      errors.email = t("error_email_required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("error_email_format");
    }

    if (!formData.password.trim()) {
      errors.password = t("error_password_required");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await authApi.login(formData);
      
      if (result && result.token) {
        // 1. SAVE TO LOCAL STORAGE (For client API calls)
        // We save under both keys to be safe, but clientPricesApi uses "auth_token"
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("token", result.token);
        
        // 2. SAVE TO COOKIES (For Middleware/Proxy.ts authorization)
        // Expires in 7 days to match your backend JWT config
        document.cookie = `auth_token=${result.token}; path=/; max-age=604800; SameSite=Lax`;

        // 3. REDIRECT
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(t("error_invalid"));
      }
    } catch (err: unknown) { 
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred.";
      console.error("Login attempt failed:", errorMessage);
      setError(t("error_invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[90vh] px-4 py-12 bg-background/50">
        <div className="w-full max-w-md p-8 md:p-12 border rounded-[2rem] shadow-2xl bg-card animate-in fade-in zoom-in duration-500">
          
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black mb-3 tracking-tight text-foreground italic uppercase">
              {t("login_title")}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {t("welcome_message")}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm mb-8 text-center animate-shake font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-muted-foreground ml-1 tracking-wider">
                {t("email")}
              </label>
              <input
                type="email"
                placeholder={t("email_placeholder_example")}
                className={cn(
                  "w-full p-4 border rounded-2xl bg-muted/20 focus:bg-background outline-none focus:ring-2 transition-all border-border",
                  fieldErrors.email ? "border-red-500 focus:ring-red-100 bg-red-50/10" : "focus:ring-primary/20"
                )}
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined});
                }}
              />
              {fieldErrors.email && (
                <p className="text-[10px] text-red-500 ml-2 font-bold animate-in fade-in slide-in-from-top-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-muted-foreground ml-1 tracking-wider">
                {t("password")}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={cn(
                  "w-full p-4 border rounded-2xl bg-muted/20 focus:bg-background outline-none focus:ring-2 transition-all border-border",
                  fieldErrors.password ? "border-red-500 focus:ring-red-100 bg-red-50/10" : "focus:ring-primary/20"
                )}
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if (fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined});
                }}
              />
              {fieldErrors.password && (
                <p className="text-[10px] text-red-500 ml-2 font-bold animate-in fade-in slide-in-from-top-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-8 text-lg font-bold rounded-4xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("loading")}</span>
                </>
              ) : (
                t("login_button")
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("no_account")}{" "}
            <button 
              onClick={() => router.push("/register")}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              {t("register_cta")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}