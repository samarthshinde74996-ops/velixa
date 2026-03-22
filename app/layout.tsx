import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: { default: "Velixa — Describe it. We'll build it.", template: "%s | Velixa" },
  description: "AI-powered spreadsheet generator. Type in plain English, get a complete Excel-ready sheet with formulas, sample data, and export options in seconds.",
  keywords: ["spreadsheet generator", "AI Excel", "formula generator", "salary sheet", "India"],
  openGraph: {
    title: "Velixa — AI Spreadsheet Generator",
    description: "Turn plain English into complete spreadsheets instantly.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
