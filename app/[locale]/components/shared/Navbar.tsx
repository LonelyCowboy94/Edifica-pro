import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "../ui/button";

export default function Navbar() {
  const t = useTranslations("Navbar"); 

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tighter">
            EDIFICA<span className="text-primary">.PRO</span>
          </Link>
        </div>

        {/* NAV LINKOVI - Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-primary">
            {t("features")}
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-primary">
            {t("pricing")}
          </Link>
          <Link href="#contact" className="transition-colors hover:text-primary">
            {t("contact")}
          </Link>
        </div>

        {/* DESNA STRANA (Jezik + Auth) */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            {t("login")}
          </Button>
          </Link>
          <Link href="/register">
          <Button size="sm">
            {t("register")}
          </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}