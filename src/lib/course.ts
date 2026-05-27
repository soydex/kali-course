import fs from "node:fs";
import path from "node:path";

const COURSE_DIR = path.join(process.cwd(), "Hacking Éthique Avec Kali Linux");

export interface Resource {
  title: string;
  url: string;
  type: "link" | "pdf";
}

export interface Lesson {
  id: string;
  title: string;
  hasContent: boolean;
  resources: Resource[];
}

export interface Section {
  id: string;
  title: string;
  dirName: string;
  lessons: Lesson[];
}

function extractUrl(htmlPath: string): string | null {
  const content = fs.readFileSync(htmlPath, "utf-8");
  const match = content.match(/window\.location\s*=\s*["']([^"']+)["']/);
  return match?.[1] ?? null;
}

export function getSections(): Section[] {
  const entries = fs.readdirSync(COURSE_DIR, { withFileTypes: true });

  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/^(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    });

  return dirs.map((dir) => {
    const id = dir.match(/^(\d+)/)?.[1] ?? dir;
    const title = dir
      .replace(/^\d+\.\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    const sectionPath = path.join(COURSE_DIR, dir);
    const files = fs.readdirSync(sectionPath);

    const lessonMap = new Map<string, Lesson>();

    for (const file of files) {
      const match = file.match(/^(\d+)\. (.+)\.(txt|mp4)$/);
      if (!match) continue;
      const [, lessonId, lessonTitle, ext] = match;
      const existing = lessonMap.get(lessonId);
      if (!existing || ext === "txt") {
        lessonMap.set(lessonId, {
          id: lessonId,
          title: lessonTitle.replace(/\s+/g, " ").trim(),
          hasContent: ext === "txt",
          resources: existing?.resources ?? [],
        });
      }
    }

    for (const file of files) {
      const match = file.match(/^(\d+)\.(\d+)\s+(.+)\.html$/);
      if (!match) continue;
      const [, parentId, , resourceTitle] = match;
      const lesson = lessonMap.get(parentId);
      if (!lesson) continue;
      const url = extractUrl(path.join(sectionPath, file));
      if (!url) continue;
      lesson.resources.push({
        title: resourceTitle.replace(/\s+/g, " ").trim(),
        url,
        type: "link",
      });
    }

    for (const file of files) {
      const match = file.match(/^(\d+)\.(\d+)\s+(.+)\.pdf$/);
      if (!match) continue;
      const [, parentId, , resourceTitle] = match;
      const lesson = lessonMap.get(parentId);
      if (!lesson) continue;
      lesson.resources.push({
        title: resourceTitle.replace(/\s+/g, " ").trim(),
        url: `/pdf/${id}/${parentId}`,
        type: "pdf",
      });
    }

    const lessons = [...lessonMap.values()].sort(
      (a, b) => parseInt(a.id, 10) - parseInt(b.id, 10),
    );

    return { id, title, dirName: dir, lessons };
  });
}

export function getSection(id: string): Section | null {
  return getSections().find((s) => s.id === id) ?? null;
}

export interface LessonRef {
  sectionId: string;
  lessonId: string;
  title: string;
}

export function getAdjacentLessons(
  sectionId: string,
  lessonId: string,
): { prev: LessonRef | null; next: LessonRef | null } {
  const all = getSections().flatMap((s) =>
    s.lessons
      .filter((l) => l.hasContent)
      .map((l) => ({ sectionId: s.id, lessonId: l.id, title: l.title })),
  );

  const idx = all.findIndex(
    (l) => l.sectionId === sectionId && l.lessonId === lessonId,
  );

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function getLessonContent(
  sectionId: string,
  lessonId: string,
): { title: string; content: string; resources: Resource[] } | null {
  const section = getSection(sectionId);
  if (!section) return null;

  const lesson = section.lessons.find((l) => l.id === lessonId);
  if (!lesson?.hasContent) return null;

  const sectionPath = path.join(COURSE_DIR, section.dirName);
  const files = fs.readdirSync(sectionPath);

  const file = files.find((f) => {
    const match = f.match(/^(\d+)\. .+\.txt$/);
    return match?.[1] === lessonId;
  });

  if (!file) return null;

  const title = file.replace(/\.txt$/, "").replace(/^\d+\. /, "");
  const content = fs.readFileSync(path.join(sectionPath, file), "utf-8");

  return { title, content, resources: lesson.resources };
}
