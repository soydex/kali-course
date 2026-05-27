import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import { getSection, getSections } from "@/lib/course";
import { type Locale, getDict } from "@/lib/i18n";

export function generateStaticParams() {
  return getSections().map((s) => ({ sectionId: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getSection(sectionId);
  return { title: section?.title ?? "Section" };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; sectionId: string }>;
}) {
  const { locale, sectionId } = await params;
  const section = getSection(sectionId);
  if (!section) notFound();

  const t = getDict(locale);

  return (
    <main className="min-h-screen bg-black px-16 py-20 max-w-2xl">
      <Breadcrumb
        homeHref={`/${locale}`}
        homeLabel={t.courses}
        items={[{ label: section.title }]}
      />

      <h1 className="text-white font-[family-name:var(--font-doto)] text-3xl font-light mb-16 mt-8">
        {section.title}
      </h1>

      <nav className="flex flex-col">
        {section.lessons.map((lesson) => (
          <div key={lesson.id} className="flex flex-col">
            {lesson.hasContent ? (
              <Link
                href={`/${locale}/${section.id}/${lesson.id}`}
                className="flex items-baseline gap-8 py-3 text-zinc-500 hover:text-white transition-colors duration-150 font-mono"
              >
                <span className="text-xs w-5 shrink-0 tabular-nums">
                  {lesson.id}
                </span>
                <span>{lesson.title}</span>
              </Link>
            ) : (
              <div className="flex items-baseline gap-8 py-3 text-zinc-800 font-mono">
                <span className="text-xs w-5 shrink-0 tabular-nums">
                  {lesson.id}
                </span>
                <span>{lesson.title}</span>
              </div>
            )}

            {lesson.resources.map((resource) =>
              resource.type === "pdf" ? (
                <Link
                  key={resource.url}
                  href={`/${locale}${resource.url}`}
                  className="flex items-center gap-2 pl-13 py-1 text-zinc-700 hover:text-zinc-400 transition-colors duration-150 font-mono text-xs"
                >
                  <FileText size={11} strokeWidth={1} />
                  {resource.title}
                </Link>
              ) : (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 pl-13 py-1 text-zinc-700 hover:text-zinc-400 transition-colors duration-150 font-mono text-xs"
                >
                  <ExternalLink size={11} strokeWidth={1} />
                  {resource.title}
                </a>
              ),
            )}
          </div>
        ))}
      </nav>
    </main>
  );
}
