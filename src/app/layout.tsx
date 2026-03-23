import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Layer",
  description: "Aggregated content feed with discussion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-gray-100"
            >
              Content Layer
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-gray-200"
              >
                Feed
              </Link>
              <Link
                href="/submit"
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
              >
                Submit
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
