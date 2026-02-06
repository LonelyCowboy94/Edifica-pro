"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserMeResponse } from "@/lib/api/types";

interface UserNavProps {
  user: UserMeResponse | null;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations("Dashboard.user_menu");

  const handleLogout = (): void => {
    Cookies.remove("auth_token"); 
    router.push("/");      
    router.refresh();
  };

  /**
   * Generates display initials from email or company name
   */
  const getInitials = (): string => {
    if (!user) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-full transition-all border border-transparent hover:border-slate-200"
      >
        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
          {getInitials()}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* User Profile Summary */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 mb-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">
                  {user?.companyName || "Loading..."}
                </p>
                <ShieldCheck className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest italic">
                {user?.email}
              </p>
              
            </div>
            
            <div className="p-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-xl">
                  <User className="w-4 h-4 opacity-50" /> {t("account")}
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-xl">
                  <Settings className="w-4 h-4 opacity-50" /> {t("settings")}
                </button>
            </div>
            
            <div className="border-t border-slate-100 mt-1 p-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 transition-all rounded-xl uppercase tracking-widest"
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

// Helper for conditional classes if not already available globally
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}