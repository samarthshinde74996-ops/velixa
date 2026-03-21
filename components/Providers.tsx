"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a24",
            color: "#f0f0f8",
            border: "1px solid #2a2a3a",
            fontFamily: "Instrument Sans, sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#00d4aa", secondary: "#1a1a24" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#1a1a24" } },
        }}
      />
    </SessionProvider>
  );
}
