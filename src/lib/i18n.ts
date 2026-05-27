export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const dict = {
  fr: {
    courses: "cours",
    back: "retour",
    notFound: "404",
  },
  en: {
    courses: "courses",
    back: "back",
    notFound: "404",
  },
} satisfies Record<Locale, Record<string, string>>;

export function getDict(locale: Locale) {
  return dict[locale];
}

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
