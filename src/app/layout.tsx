import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "F1 Prognozes",
  description: "F1 balsošanas sistēma draugiem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv">
      <body className="antialiased min-h-screen font-sans">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  );
}
