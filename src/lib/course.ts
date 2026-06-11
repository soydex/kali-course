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

export interface LessonRef {
  sectionId: string;
  lessonId: string;
  title: string;
}

function extractUrl(htmlPath: string): string | null {
  const content = fs.readFileSync(htmlPath, "utf-8");
  const match = content.match(/window\.location\s*=\s*["']([^"']+)["']/);
  return match?.[1] ?? null;
}

const isDefaultTxt = (f: string) =>
  f.endsWith(".txt") && !/\.[a-z]{2}\.txt$/.test(f);

interface TitlesFile {
  sections: Record<string, string>;
  lessons: Record<string, Record<string, string>>;
  resources?: Record<string, Record<string, Record<string, string>>>;
}

function getTitles(locale: string): TitlesFile {
  const empty = { sections: {}, lessons: {}, resources: {} };
  if (locale === "fr") return empty;
  const titlesPath = path.join(COURSE_DIR, `_titles.${locale}.json`);
  if (!fs.existsSync(titlesPath)) return empty;
  try {
    return JSON.parse(fs.readFileSync(titlesPath, "utf-8"));
  } catch {
    return empty;
  }
}

export function getSections(locale = "fr"): Section[] {
  const {
    sections: sectionTitles,
    lessons: lessonTitles,
    resources: resourceTitles,
  } = getTitles(locale);
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
    const frTitle = dir
      .replace(/^\d+\.\s*/, "")
      .replace(/\s{2,}/g, " — ")
      .replace(/\s+/g, " ")
      .trim();
    const title = sectionTitles[id] ?? frTitle;

    const sectionPath = path.join(COURSE_DIR, dir);
    const files = fs.readdirSync(sectionPath);
    const lessonMap = new Map<string, Lesson>();

    for (const file of files) {
      const isTxt = isDefaultTxt(file);
      const isMp4 = file.endsWith(".mp4");
      if (!isTxt && !isMp4) continue;

      const match = file.match(/^(\d+)\. (.+)\.(txt|mp4)$/);
      if (!match) continue;
      const [, lessonId, lessonTitle, ext] = match;
      const existing = lessonMap.get(lessonId);
      if (!existing || ext === "txt") {
        const frTitle = lessonTitle
          .replace(/ - /g, " — ")
          .replace(/\s+/g, " ")
          .trim();
        lessonMap.set(lessonId, {
          id: lessonId,
          title: lessonTitles[id]?.[lessonId] ?? frTitle,
          hasContent: ext === "txt",
          resources: existing?.resources ?? [],
        });
      }
    }

    for (const file of files) {
      const match = file.match(/^(\d+)\.(\d+)\s+(.+)\.html$/);
      if (!match) continue;
      const [, parentId, resourceId, resourceTitle] = match;
      const lesson = lessonMap.get(parentId);
      if (!lesson) continue;
      const url = extractUrl(path.join(sectionPath, file));
      if (!url) continue;
      const frTitle = resourceTitle.replace(/\s+/g, " ").trim();
      const title = resourceTitles?.[id]?.[parentId]?.[resourceId] ?? frTitle;
      lesson.resources.push({
        title,
        url,
        type: "link",
      });
    }

    for (const file of files) {
      const match = file.match(/^(\d+)\.(\d+)\s+(.+)\.pdf$/);
      if (!match) continue;
      const [, parentId, resourceId, resourceTitle] = match;
      const lesson = lessonMap.get(parentId);
      if (!lesson) continue;
      const frTitle = resourceTitle.replace(/\s+/g, " ").trim();
      const title = resourceTitles?.[id]?.[parentId]?.[resourceId] ?? frTitle;
      lesson.resources.push({
        title,
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

export function getSection(id: string, locale = "fr"): Section | null {
  return getSections(locale).find((s) => s.id === id) ?? null;
}

export function getAdjacentLessons(
  sectionId: string,
  lessonId: string,
  locale = "fr",
): { prev: LessonRef | null; next: LessonRef | null } {
  const all = getSections(locale).flatMap((s) =>
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
  locale = "fr",
): { title: string; content: string; resources: Resource[] } | null {
  const section = getSection(sectionId, locale);
  if (!section) return null;

  const lesson = section.lessons.find((l) => l.id === lessonId);
  if (!lesson?.hasContent) return null;

  const sectionPath = path.join(COURSE_DIR, section.dirName);
  const files = fs.readdirSync(sectionPath);

  let file: string | undefined;

  if (locale !== "fr") {
    file = files.find((f) => {
      if (!f.endsWith(`.${locale}.txt`)) return false;
      return f.match(/^(\d+)\./)?.[1] === lessonId;
    });
  }

  if (!file) {
    file = files.find((f) => {
      if (!isDefaultTxt(f)) return false;
      return f.match(/^(\d+)\./)?.[1] === lessonId;
    });
  }

  if (!file) return null;

  const { lessons: lessonTitles } = getTitles(locale);
  const frTitle = file
    .replace(/\.[a-z]{2}\.txt$/, "")
    .replace(/\.txt$/, "")
    .replace(/^\d+\. /, "")
    .replace(/ - /g, " — ");
  const title = lessonTitles[sectionId]?.[lessonId] ?? frTitle;
  const content = fs.readFileSync(path.join(sectionPath, file), "utf-8");

  return { title, content, resources: lesson.resources };
}
