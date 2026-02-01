"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Dashboard.user_menu");

  const handleLogout = () => {
    Cookies.remove("auth_token"); // Brišemo token
    router.push("/");        // Šaljemo ga na login
    router.refresh();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-secondary rounded-full transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          U
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-card border rounded-xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-2 border-b mb-2">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">admin@edifica.com</p>
            </div>
            
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
              <User className="w-4 h-4" /> {t("account")}
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
              <Settings className="w-4 h-4" /> {t("settings")}
            </button>
            
            <div className="border-t mt-2 pt-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> {t("logout")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}