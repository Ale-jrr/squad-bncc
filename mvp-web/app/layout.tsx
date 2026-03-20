import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MVP BNCC Inclusivo",
  description: "Gerador de atividades inclusivas alinhadas a BNCC"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
