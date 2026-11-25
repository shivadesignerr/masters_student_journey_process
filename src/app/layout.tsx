import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GVK Edutech — Masters Student & Counselor Management Platform",
  description:
    "Enterprise web-based Student and Counselor Management Platform for Masters Abroad programs by GVK Edutech.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gvk-bg antialiased selection:bg-gvk-navy selection:text-white">
        {children}
      </body>
    </html>
  );
}
