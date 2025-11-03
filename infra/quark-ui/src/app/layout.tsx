import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import "./fonts.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
});

export const metadata: Metadata = {
  title: "Quark - Цифровая вселенная для самовыражения",
  description: "Quark - экспериментальная платформа для блогов, общения и работы с ИИ-агентами.",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
