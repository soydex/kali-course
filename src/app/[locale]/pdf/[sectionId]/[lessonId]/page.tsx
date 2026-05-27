import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSection } from "@/lib/course";
import type { Locale } from "@/lib/i18n";

export default async function PdfViewerPage({
  params,
}: {
  params: Promise<{ locale: Locale; sectionId: string; lessonId: string }>;
}) {
  const { locale, sectionId, lessonId } = await params;
  const section = getSection(sectionId);
  if (!section) notFound();

  const lesson = section.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const pdfResource = lesson.resources.find((r) => r.type === "pdf");
  if (!pdfResource) notFound();

  const backHref = lesson.hasContent
    ? `/${locale}/${sectionId}/${lessonId}`
    : `/${locale}/${sectionId}`;

  return (
    <main className="h-screen bg-black flex flex-col">
      <div className="flex items-center gap-4 px-8 py-4 shrink-0">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-zinc-600 hover:text-white font-mono text-sm transition-colors duration-150"
        >
          <ArrowLeft size={14} strokeWidth={1} />
          {lesson.hasContent ? lesson.title : section.title}
        </Link>
        <span className="text-zinc-800 font-mono text-xs ml-auto">
          {pdfResource.title}
        </span>
      </div>

      <iframe
        src={`/api/pdf/${sectionId}/${lessonId}`}
        className="flex-1 w-full"
        title={pdfResource.title}
      />
    </main>
  );
}
