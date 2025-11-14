import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrutyLab",
  description: "Sistema de Gestión FrutyLab",
  openGraph: {
    title: "Sistema de Gestión FrutyLab",
    description: "Sistema de Gestión FrutyLab",
    url: "https://frutylab.vercel.app",
    siteName: "FrutyLab",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sistema de Gestión FrutyLab",
    description: "Sistema de Gestión FrutyLab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
