import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { Inter, Outfit, Oxanium } from "next/font/google";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { AtlasLoader } from "@/components/effects/AtlasLoader";
import { FilmGrain } from "@/components/effects/FilmGrain";
import { SmoothScroller } from "@/components/effects/SmoothScroller";
import { CanvasBackground } from "@/components/effects/CanvasBackground";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit" 
});

const oxanium = Oxanium({ 
  subsets: ["latin"], 
  variable: "--font-heading" 
});

export const metadata: Metadata = {
  title: "PC Guide Pro - Custom PC Builder & Tech Community",
  description: "Create and customize your dream desktop build with interactive component compatibility, real-time sync, and smart AI recommendations.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${oxanium.variable} antialiased relative`} suppressHydrationWarning>
        <AtlasLoader />
        <FilmGrain />
        <SmoothScroller>
          <CanvasBackground />
          <CursorGlow />
          <CustomCursor />
          <Providers>{children}</Providers>
        </SmoothScroller>
      </body>
    </html>
  );
}
