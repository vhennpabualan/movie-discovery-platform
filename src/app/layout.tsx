import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SearchBar } from "@/features/search/components/SearchBar";
import { MobileNav } from "@/features/ui/components/MobileNav";
import { PerformanceDashboard } from "@/features/ui/components/PerformanceDashboard";
import { WebVitalsInitializer } from "@/features/ui/components/WebVitalsInitializer";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Discovery Platform",
  description: "Discover, search, and manage your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ viewTransitionName: 'root' } as any}
    >
      <body className="min-h-full flex flex-col bg-netflix-dark">
        <WebVitalsInitializer />
        <PerformanceDashboard />
        {/* Header with Navigation */}
        <header className="bg-netflix-dark border-b border-netflix-gray/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center justify-between gap-4">
              {/* Logo/Home Link */}
              <Link
                href="/"
                className="text-xl md:text-2xl font-bold text-netflix-red hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-2 py-1 shrink-0"
              >
                MovieFlix
              </Link>

              {/* Search Bar - Full width on mobile, constrained on desktop */}
              <div className="hidden md:flex flex-1 max-w-md">
                <Suspense fallback={<div className="h-10 bg-netflix-dark-secondary rounded-lg animate-pulse" />}>
                  <SearchBar />
                </Suspense>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-4 shrink-0">
                <Link
                  href="/watchlist"
                  className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
                >
                  Watchlist
                </Link>
              </nav>

              {/* Mobile Navigation */}
              <MobileNav />
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden mt-4">
              <Suspense fallback={<div className="h-10 bg-netflix-dark-secondary rounded-lg animate-pulse" />}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-netflix-dark">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-netflix-dark-secondary border-t border-netflix-gray/20 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-netflix-gray text-sm">
            <p>&copy; 2024 Movie Discovery Platform. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
