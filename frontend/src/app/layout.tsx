import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskMaster - Professional Task Management",
  description: "Advanced task management system with enhanced features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans h-full bg-gray-50 antialiased`}
      >
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
