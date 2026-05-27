import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black px-16 py-20 max-w-2xl">
      <h1 className="text-white font-[family-name:var(--font-doto)] text-2xl font-light mb-16 mt-8">
        404
      </h1>
      <Link
        href="/"
        className="flex items-center gap-2 text-zinc-400 hover:text-white font-mono text-sm transition-colors duration-150"
      >
        <ArrowLeft size={14} strokeWidth={1} />
        cours
      </Link>
    </main>
  );
}
