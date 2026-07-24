import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";
import { QueryProvider } from "@/components/query-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AXOM — Federal Intelligence",
  description: "Federal funding intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <QueryProvider>
          <AppStateProvider>
            <AppShell>{children}</AppShell>
          </AppStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
