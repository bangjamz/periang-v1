import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { MobileHeader } from "@/components/mobile-header";
import { RouteGuard } from "@/components/route-guard";
import { TourProvider } from "@/components/tour/tour-provider";

config.autoAddCss = false;

// Font ramah & mudah dibaca (menggantikan Geist) — lihat PRD "Huruf Ramah dan Angka Menonjol".
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PERIANG",
  description: "Prediksi dan Analisis Balita Gizi Kurang",
  icons: {
    icon: [
      {
        url: "/images/brand/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/brand/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/images/brand/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [{ url: "/images/brand/app-icon-192.png", sizes: "192x192" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <RouteGuard>
          <TourProvider>
            <TopNav />
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-white pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:max-w-2xl sm:pb-0 lg:max-w-5xl dark:bg-black">
              <MobileHeader />
              {children}
            </div>
            <BottomNav />
          </TourProvider>
        </RouteGuard>
      </body>
    </html>
  );
}
