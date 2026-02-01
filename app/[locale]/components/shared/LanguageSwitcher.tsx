"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Shadcn Select

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onLanguageChange = (newLocale: string) => {
    // Menjamo locale u URL-u (npr. /sr/about -> /en/about)
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Select defaultValue={locale} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-30 bg-transparent border-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sr">Srbija (RS)</SelectItem>
        <SelectItem value="en">English (US)</SelectItem>
        <SelectItem value="de">Deutsch (DE)</SelectItem>
      </SelectContent>
    </Select>
  );
}