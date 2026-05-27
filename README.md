# Hacking Éthique Avec Kali Linux

Plateforme de cours sur le penetration testing, transcriptions Whisper, UI minimaliste black.

## Stack

- **Next.js 16** — App Router, server components, static rendering
- **Tailwind CSS v4** — utility-first, no config file
- **Biome** — linter + formatter
- **Bun** — package manager & runtime
- **Whisper (medium)** — transcription des vidéos MP4 → TXT

## Structure

```
src/
├── app/
│   ├── [sectionId]/              # liste des leçons
│   │   └── [lessonId]/           # contenu de la leçon
│   ├── pdf/[sectionId]/[lessonId]/   # viewer PDF intégré
│   └── api/pdf/[sectionId]/[lessonId]/   # route qui sert les PDF
├── lib/
│   └── course.ts                 # lecture du filesystem, parsing
└── components/
    └── Breadcrumb.tsx

Hacking Éthique Avec Kali Linux/
├── 1. Introduction/
├── 2. Phase I  Reconnaissance/
└── ...                           # 11 sections, ~29 leçons
```