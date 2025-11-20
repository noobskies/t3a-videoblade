import "@/styles/globals.css";
import "@/styles/calendar.css";

import { type Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";

import { TRPCReactProvider } from "@/trpc/react";
import { AppShell } from "@/app/_components/layout/app-shell";

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
              <AppShell>{children}</AppShell>
            </TRPCReactProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
