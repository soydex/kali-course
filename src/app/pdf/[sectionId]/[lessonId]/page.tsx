import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSection } from "@/lib/course";
import { notFound } from "next/navigation";

export default async function PdfViewerPage({
  params,
}: {
  params: Promise<{ sectionId: string; lessonId: string }>;
}) {
  const { sectionId, lessonId } = await params;
  const section = getSection(sectionId);
  if (!section) notFound();

  const lesson = section.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const pdfResource = lesson.resources.find((r) => r.type === "pdf");
  if (!pdfResource) notFound();

  return (
    <main className="h-screen bg-black flex flex-col">
      <div className="flex items-center gap-4 px-8 py-4 shrink-0">
        <Link
          href={
            lesson.hasContent ? `/${sectionId}/${lessonId}` : `/${sectionId}`
          }
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
