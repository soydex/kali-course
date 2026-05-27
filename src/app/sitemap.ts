import type { MetadataRoute } from "next";
import { getSections } from "@/lib/course";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({ url: `${base}/${locale}` });
    for (const section of getSections(locale)) {
      entries.push({ url: `${base}/${locale}/${section.id}` });
      for (const lesson of section.lessons.filter((l) => l.hasContent)) {
        entries.push({ url: `${base}/${locale}/${section.id}/${lesson.id}` });
      }
    }
  }

  return entries;
}
