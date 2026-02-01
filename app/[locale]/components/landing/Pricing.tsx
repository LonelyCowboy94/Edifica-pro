import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Check } from "lucide-react"; 

export default function Pricing() {
  const t = useTranslations("Pricing");

  const plans = [
    { name: "free", price: "0", workers: 3, admins: 1 },
    { name: "small", price: "49", workers: 10, admins: 1 },
    { name: "medium", price: "99", workers: 30, admins: 2 },
    { name: "enterprise", price: "199", workers: 50, admins: 4 },
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-background rounded-2xl border p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wider">
                {t(`plans.${plan.name}.name`)}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">€{plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              
              <ul className="space-y-4 mb-8 grow">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.workers} {t("features.workers")}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.admins} {t("features.admins")}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {t("features.price_lists")}
                </li>
              </ul>

              <Button variant={plan.name === "medium" ? "primary" : "outline"} className="w-full">
                {t("cta")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}