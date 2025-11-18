import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClientLayout } from "@/app/_components/client-layout";

export const metadata: Metadata = {
  title: "VideoBlade - Multi-Platform Video Publishing",
  description: "Upload once, publish everywhere",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ClientLayout>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
