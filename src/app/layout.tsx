import "@/styles/globals.css";

import { type Metadata } from "next";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";

import { TRPCReactProvider } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "VideoBlade - Multi-Platform Video Publishing",
  description: "Upload once, publish everywhere",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TRPCReactProvider>
              <nav className="border-b border-gray-800 bg-gray-900">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                  <Link href="/" className="text-xl font-bold text-white">
                    VideoBlade
                  </Link>
                  <div className="flex gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/library">Library</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/platforms">Platforms</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/upload">Upload</Link>
                    </Button>
                  </div>
                </div>
              </nav>
              {children}
            </TRPCReactProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
