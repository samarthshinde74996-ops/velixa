import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from '@vercel/analytics/react';
import Script from "next/script";

export const metadata: Metadata = {
  title: { default: "Velixa — Describe it. We'll build it.", template: "%s | Velixa" },
  description: "AI-powered spreadsheet generator. Type in plain English, get a complete Excel-ready sheet in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-LD2T6DJQBM" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LD2T6DJQBM');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}