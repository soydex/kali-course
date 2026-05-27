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

export const metadata: Metadata = {
  title: "Hacking Éthique Avec Kali Linux",
  description: "Formation complète au penetration testing avec Kali Linux",
  icons: { icon: "/icon.svg" },
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
