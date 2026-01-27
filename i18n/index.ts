import en from "./en";
import pt from "./pt";

type Language = "pt" | "en";

type StringDict<T> = {
  [K in keyof T]: T[K] extends object ? StringDict<T[K]> : string;
};

type Dict = StringDict<typeof pt>;

const translations = {
  pt,
  en,
} satisfies Record<Language, Dict>;

const currentLanguage: Language = "pt";

export function t<S extends keyof Dict, K extends keyof Dict[S]>(
  section: S,
  key: K
) {
  return translations[currentLanguage][section][key];
}
