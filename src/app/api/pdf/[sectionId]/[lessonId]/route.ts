import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSection } from "@/lib/course";

const COURSE_DIR = path.join(process.cwd(), "Hacking Éthique Avec Kali Linux");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sectionId: string; lessonId: string }> },
) {
  const { sectionId, lessonId } = await params;
  const section = getSection(sectionId);
  if (!section) return new NextResponse("Not found", { status: 404 });

  const sectionPath = path.join(COURSE_DIR, section.dirName);
  const files = fs.readdirSync(sectionPath);

  const pdfFile = files.find((f) => {
    const match = f.match(/^(\d+)\.(\d+)\s+.+\.pdf$/);
    return match?.[1] === lessonId;
  });

  if (!pdfFile) return new NextResponse("Not found", { status: 404 });

  const buffer = fs.readFileSync(path.join(sectionPath, pdfFile));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdfFile}"`,
    },
  });
}
