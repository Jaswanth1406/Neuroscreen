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
      <head>
        {/* Bootstrap for grid utilities and components */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${roboto.variable} font-sans antialiased neuro-body`}>
        <ThemeProvider defaultTheme="system" storageKey="neuroscreen-theme">
          {/* Main glassmorphism background wrapper */}
          <div className="neuro-bg">
            <div className="neuro-bg-overlay" />
            <div className="neuro-bg-content">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
