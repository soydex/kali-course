"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref: string;
  homeLabel: string;
}

export default function Breadcrumb({
  items,
  homeHref,
  homeLabel,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 font-mono text-sm mb-16 text-zinc-400 select-none min-w-0 overflow-hidden"
    >
      <button
        onClick={() => window.history.back()}
        className="shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors duration-150 cursor-pointer"
        aria-label={homeLabel === "courses" ? "Back" : "Retour"}
        type="button"
      >
        <ArrowLeft size={14} strokeWidth={1} />
      </button>

      <span className="shrink-0 text-zinc-600 font-light" aria-hidden="true">
        /
      </span>

      <Link
        href={homeHref}
        className="shrink-0 hover:text-white transition-colors duration-150"
      >
        {homeLabel}
      </Link>

      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 text-zinc-600 font-light"
            aria-hidden="true"
          >
            /
          </span>
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-white transition-colors duration-150 truncate min-w-0"
              style={{ flexShrink: i < items.length - 1 ? 2 : 1 }}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-400 truncate min-w-0 shrink">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
