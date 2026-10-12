import type { Metadata } from "next";
import { Hanken_Grotesk, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Smile Lab · Estudio de anuncios",
  description: "Anuncios de Meta y Google Ads para Smile Lab Odontología",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jost.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
