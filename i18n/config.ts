import en from "@/messages/en.json";
import sr from "@/messages/sr.json";
import de from "@/messages/de.json";
import { Messages } from "./types";

export const messages: Record<string, Messages> = { en, sr, de };
export const defaultLocale = "en";
export const locales = ["en", "sr", "de"];
