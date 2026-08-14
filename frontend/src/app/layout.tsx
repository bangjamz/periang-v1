import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { MobileHeader } from "@/components/mobile-header";
import { RouteGuard } from "@/components/route-guard";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PERIANG",
  description: "Prediksi dan Analisis Balita Gizi Kurang",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <RouteGuard>
          <TopNav />
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-white pb-16 sm:max-w-2xl sm:pb-0 lg:max-w-5xl dark:bg-black">
            <MobileHeader />
            {children}
          </div>
          <BottomNav />
        </RouteGuard>
      </body>
    </html>
  );
}
