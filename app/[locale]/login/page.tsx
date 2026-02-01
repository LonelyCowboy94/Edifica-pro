"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";

/**
 * Login Page Component.
 * Handles user authentication and navigation to dashboard.
 */
export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handles the login form submission.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Koristimo authApi servis
      const result = await authApi.login(formData);
      
      if (result.token) {
        // Napomena: authApi.login već interno čuva 'auth_token' u Cookies.
        
        // Preusmeravamo na Dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        // Ako backend vrati grešku u JSON-u
        setError(result.error || t("error_invalid"));
      }
    } catch (err) {
      // Hvatanje mrežnih ili server grešaka
      console.error("Login failed:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-8 border rounded-3xl shadow-2xl bg-card animate-in fade-in zoom-in duration-300">
          <h1 className="text-3xl font-black mb-2 text-center tracking-tight">
            {t("login_title")}
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Dobrodošli nazad u Edifica Pro sistem.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                {t("email")}
              </label>
              <input
                type="email"
                placeholder="primer@firma.rs"
                className="w-full p-3.5 border rounded-xl bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                {t("password")}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3.5 border rounded-xl bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-7 text-lg font-bold rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
            >
              {loading ? "Prijava..." : t("login_button")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("no_account")}{" "}
            <button 
              onClick={() => router.push("/register")}
              className="text-primary font-bold hover:underline"
            >
              Registrujte se
            </button>
          </p>
        </div>
      </div>
    </>
  );
}