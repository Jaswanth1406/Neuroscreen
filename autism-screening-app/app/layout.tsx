import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "NeuroScreen - AI Autism Screening",
  description: "AI-powered Autism Spectrum Disorder Screening Support Tool with therapy games and progress tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${roboto.variable} font-sans antialiased neuro-body`}>
        <ThemeProvider defaultTheme="system" storageKey="neuroscreen-theme">
          {/* Main glassmorphism background wrapper */}
          <div className="neuro-bg">
            <div className="neuro-bg-overlay" />
            <div className="neuro-bg-content">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html >
  );
}
