import type { Metadata } from "next";
import { Doto, Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hacking Éthique Avec Kali Linux",
    template: "%s — Hacking Éthique Avec Kali Linux",
  },
  description: "Formation complète au penetration testing avec Kali Linux.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    siteName: "Hacking Éthique Avec Kali Linux",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const heads = await headers();
  const pathname = heads.get("x-pathname") ?? "/fr";
  const locale = pathname.startsWith("/en") ? "en" : "fr";

  return (
    <html lang={locale}>
      <body
        className={`${doto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
