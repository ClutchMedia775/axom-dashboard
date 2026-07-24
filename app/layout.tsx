import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";
import { QueryProvider } from "@/components/query-provider";
import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";

// Chakra Petch carries the identity — headings, labels, numerals.
const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

// Inter handles paragraph text, where Chakra Petch's angularity tires the eye.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AXOM — Federal Intelligence",
  description: "Federal funding intelligence dashboard",
};

// Applies the stored theme before first paint so the page never flashes
// the wrong skin. Defaults to Obsidian when nothing is stored.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('axom-theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chakra.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AppStateProvider>
            <AppShell>{children}</AppShell>
          </AppStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
