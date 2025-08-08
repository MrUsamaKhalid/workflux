import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use the Inter font family for a clean, modern look across the app
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workflux",
  description: "Automate your job search and career growth with AI-powered resumes, cover letters and job tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Apply Inter font and a dark gradient background consistent with the landing page
        className={`${inter.variable} antialiased bg-gradient-to-br from-[#12073b] via-[#2e014e] to-[#411080] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
