"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/lib/api"; // Funkcija koju smo ranije definisali
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "../components/shared/Navbar";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginUser(formData);
      
      if (result.token) {
        // Čuvamo token u cookies (ovo omogućava backendu da nas prepozna)
        Cookies.set("auth_token", result.token, { expires: 7 });
        
        // Preusmeravamo na Dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(t("error_invalid"));
      }
    } catch (err) {
        console.error("Login error:", err);
      setError("Server error. Try again.");
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center min-h-[80vh]">
        
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-xl bg-card">
        <h1 className="text-3xl font-bold mb-6 text-center">{t("login_title")}</h1>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("email")}</label>
            <input
              type="email"
              className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("password")}</label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl bg-background focus:ring-2 focus:ring-primary"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full py-6 text-lg font-semibold rounded-xl">
            {t("login_button")}
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}