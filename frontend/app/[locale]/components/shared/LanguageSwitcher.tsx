"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flags } from "./Icons";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "sr", label: "SR", Flag: Flags.sr },
    { code: "en", label: "EN", Flag: Flags.en },
    { code: "de", label: "DE", Flag: Flags.de },
  ];

  const onLanguageChange = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  const CurrentFlag = Flags[locale as keyof typeof Flags] || Flags.sr;

  return (
    <Select value={locale} onValueChange={onLanguageChange}>
      <SelectTrigger className="flex w-auto h-8 gap-1.5 border-none bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 px-2 py-0 shadow-none transition-all">
        <CurrentFlag className="w-4 h-auto rounded-[1px] shadow-sm" />
        <span className="text-[11px] font-bold uppercase tracking-tight">
          {locale}
        </span>
        <div className="sr-only">
          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent 
        align="end" 
        className="min-w-17.5 p-1 rounded-xl shadow-xl border-border bg-card/95 backdrop-blur-md"
      >
        {languages.map(({ code, Flag }) => (
          <SelectItem 
            key={code} 
            value={code} 
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer focus:bg-primary/10 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-auto rounded-[1px]" />
          
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}