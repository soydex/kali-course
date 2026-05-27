import { ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  getAdjacentLessons,
  getLessonContent,
  getSection,
  getSections,
} from "@/lib/course";

export function generateStaticParams() {
  return getSections().flatMap((s) =>
    s.lessons
      .filter((l) => l.hasContent)
      .map((l) => ({ sectionId: s.id, lessonId: l.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionId: string; lessonId: string }>;
}) {
  const { sectionId, lessonId } = await params;
  const lesson = getLessonContent(sectionId, lessonId);
  return { title: lesson?.title ?? "Leçon" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ sectionId: string; lessonId: string }>;
}) {
  const { sectionId, lessonId } = await params;

  const section = getSection(sectionId);
  if (!section) notFound();

  const lesson = getLessonContent(sectionId, lessonId);
  if (!lesson) notFound();

  const { prev, next } = getAdjacentLessons(sectionId, lessonId);

  const paragraphs = lesson.content
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÿ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <main className="min-h-screen bg-black px-16 py-20 max-w-2xl">
      <Breadcrumb
        items={[
          { label: section.title, href: `/${sectionId}` },
          { label: lesson.title },
        ]}
      />

      <h1 className="text-white font-[family-name:var(--font-doto)] text-2xl font-light mb-16 mt-8">
        {lesson.title}
      </h1>

      <div className="flex flex-col gap-6">
        {paragraphs.map((p, i) => {
          return (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: paragraph list is static and stable
              key={i}
              className="text-zinc-400 font-mono text-sm leading-7 hover:text-white transition-colors duration-150"
            >
              {p}
            </p>
          );
        })}
      </div>

      {lesson.resources.length > 0 && (
        <div className="mt-20 flex flex-col gap-3">
          {lesson.resources.map((resource) =>
            resource.type === "pdf" ? (
              <Link
                key={resource.url}
                href={resource.url}
                className="flex items-center gap-2 text-zinc-700 hover:text-zinc-400 transition-colors duration-150 font-mono text-xs"
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
                className="flex items-center gap-2 text-zinc-700 hover:text-zinc-400 transition-colors duration-150 font-mono text-xs"
              >
                <ExternalLink size={11} strokeWidth={1} />
                {resource.title}
              </a>
            ),
          )}
        </div>
      )}

      <div className="mt-20 pt-8 flex items-center justify-between gap-4 font-mono text-sm">
        {prev ? (
          <Link
            href={`/${prev.sectionId}/${prev.lessonId}`}
            className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors duration-150 min-w-0"
          >
            <ArrowLeft size={14} strokeWidth={1} className="shrink-0" />
            <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/${next.sectionId}/${next.lessonId}`}
            className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors duration-150 min-w-0 text-right"
          >
            <span className="truncate">{next.title}</span>
            <ArrowRight size={14} strokeWidth={1} className="shrink-0" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
