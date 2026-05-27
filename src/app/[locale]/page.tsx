import Link from "next/link";
import { getSections } from "@/lib/course";
import { type Locale } from "@/lib/i18n";
import Kali from "@/app/components/ui";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const sections = getSections();
  return (
    <main className="min-h-screen bg-black px-16 py-20 max-w-2xl">
      <div className="flex items-center gap-8 mb-20">
        <Kali className="h-12 w-12" />
        <h1 className="text-white font-[family-name:var(--font-doto)] text-4xl font-light leading-tight">
          Hacking Éthique
          <br />
          Avec Kali Linux
        </h1>
      </div>

      <nav className="flex flex-col">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/${locale}/${section.id}`}
            className="flex items-baseline gap-8 py-3 text-zinc-500 hover:text-white transition-colors duration-150 font-mono"
          >
            <span className="text-xs w-5 shrink-0 tabular-nums">
              {section.id.padStart(2, "0")}
            </span>
            <span>{section.title}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-16 flex gap-4 font-mono text-xs text-zinc-800">
        {(["fr", "en"] as const).map((l) => (
          <Link
            key={l}
            href={`/${l}`}
            className={
              l === locale
                ? "text-zinc-500"
                : "hover:text-zinc-500 transition-colors"
            }
          >
            {l}
          </Link>
        ))}
      </div>
    </main>
  );
}
