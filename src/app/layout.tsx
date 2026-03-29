import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/features/ui/components/Header";
import { PerformanceDashboard } from "@/features/ui/components/PerformanceDashboard";
import { WebVitalsInitializer } from "@/features/ui/components/WebVitalsInitializer";
import { NavigationProgress } from '@/features/ui/components/NavigationProgress';
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f0f0f",
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
        <NavigationProgress />
        <WebVitalsInitializer />
        <PerformanceDashboard />
        
        {/* Header with Navigation */}
        <Header />

        {/* Main Content - Add padding to account for fixed header */}
        <main className="flex-1 bg-netflix-dark pt-[73px] md:pt-[97px]">
          {children}
        </main>
        {/* footer */}
        <footer className="bg-netflix-dark-secondary border-t border-netflix-gray/20 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-netflix-gray text-sm">
            <div className="flex justify-center gap-4 mb-4">
              <a href="/dmca" className="hover:text-white transition-colors">DMCA</a>
              <a href="mailto:pabsvt2015@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p>&copy; {new Date().getFullYear()} Movie Discovery Platform. Personal use only.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
