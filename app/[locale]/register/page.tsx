"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { registerCompany } from "@/lib/api";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerCompany(formData);
    
    if (result.user) {
      alert("Uspešna registracija! Sada se ulogujte.");
      router.push("/login");
    } else {
      alert("Greška: " + result.error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center min-h-[80vh]">
    <div className="max-w-md mx-auto p-8 border rounded-xl shadow-lg bg-card">
      <h1 className="text-2xl font-bold mb-6">{t("register_title")}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("company_name")}</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-background"
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("email")}</label>
          <input
            type="email"
            className="w-full p-2 border rounded bg-background"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("password")}</label>
          <input
            type="password"
            className="w-full p-2 border rounded bg-background"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <Button type="submit" className="w-full">{t("register_button")}</Button>
      </form>
    </div>
    </div>
    </>
  );
}