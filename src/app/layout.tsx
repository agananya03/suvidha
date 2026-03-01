import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "SUVIDHA 2026 | Smart City Services Kiosk",
  description: "Unified self-service government kiosk for citizens.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-dark min-h-screen flex flex-col`}>
        <I18nProvider>
          {/* GLOBAL DEMO MODE BANNER */}
          <div className="w-full bg-accent text-white text-center py-1 font-bold text-sm tracking-wider uppercase z-[110] relative">
            DEMO MODE - C-DAC Smart City Challenge 2026
          </div>

          <AccessibilityToolbar />

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: "font-sans font-medium rounded-lg shadow-lg border border-gray-100",
            }}
          />

          <main className="flex-grow flex flex-col relative overflow-hidden">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
