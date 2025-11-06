import type { Metadata } from "next";
// Используем локальные шрифты вместо Google Fonts (не блокируются)
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { Providers } from "./providers";
import "./globals.css";
import "./fonts.css";

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
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
