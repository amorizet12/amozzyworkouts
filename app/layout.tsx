import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Amozzy Workouts",
  description: "Your training calendar, exercise library, and lift log.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Amozzy",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-base-950 font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
          <NavBar />
          <main className="flex-1 px-4 pb-16 pt-4 sm:px-6">{children}</main>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
