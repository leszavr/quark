import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Quark — AI-Native Digital Universe",
  description: "Modular platform for blogs, messaging, and AI agents. Build your digital environment.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={"font-sans antialiased dark"}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
