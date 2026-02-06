import { useTranslations } from "next-intl";
import { Button } from "../ui/button";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-32 lg:pb-40">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge / Tagline */}
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-6 bg-secondary/50 text-muted-foreground">
            {t("tagline")}
          </div>

          {/* Glavni naslov */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("title")}
          </h1>

          {/* Podnaslov */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            {t("subtitle")}
          </p>

          {/* Dugmići (CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="px-8 font-semibold">
              {t("cta_primary")}
            </Button>
            <Button size="lg" variant="outline" className="px-8 font-semibold">
              {t("cta_secondary")}
            </Button>
          </div>

          {/* Placeholder za Dashboard Screenshot */}
          <div className="relative w-full max-w-5xl mx-auto mt-8 rounded-xl border bg-card shadow-2xl overflow-hidden">
             <div className="aspect-16/10 bg-muted flex items-center justify-center border-b">
                {/* Ovde će ići tvoj screenshot aplikacije */}
                <p className="text-muted-foreground font-mono text-sm">
                   [ UI Dashboard Screenshot - 1200x750 ]
                </p>
             </div>
             {/* Mali efekat sjaja ispod slike */}
             <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-blue-500/20 opacity-30 blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}