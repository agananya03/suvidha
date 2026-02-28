import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SUVIDHA 2026 | Smart City Services Kiosk",
  description: "Unified self-service government kiosk for citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-dark min-h-screen flex flex-col`}>
        {/* GLOBAL DEMO MODE BANNER */}
        <div className="w-full bg-accent text-white text-center py-1 font-bold text-sm tracking-wider uppercase z-50">
          DEMO MODE - C-DAC Smart City Challenge 2026
        </div>

        <main className="flex-grow flex flex-col relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
