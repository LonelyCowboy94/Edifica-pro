export interface IndexMessages {
  title: string;
  description: string;
  cta: string;
  login: string;
}

export interface NavbarMessages {
  features: string;
  pricing: string;
  contact: string;
  login: string;
  register: string;
}

export interface HeroMessages {
  tagline: string;
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
}

export interface PricingFeatures {
  workers: string;
  admins: string;
  price_lists: string;
}

export interface PricingPlans {
  free: { name: string };
  small: { name: string };
  medium: { name: string };
  enterprise: { name: string };
}

export interface PricingMessages {
  title: string;
  subtitle: string;
  cta: string;
  features: PricingFeatures;
  plans: PricingPlans;
}

export interface Messages {
  Index: IndexMessages;
  Navbar: NavbarMessages;
  Hero: HeroMessages;
  Pricing: PricingMessages;
}
