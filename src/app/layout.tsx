import "@/styles/globals.css";

import { type Metadata } from "next";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import theme from "@/theme";

import { TRPCReactProvider } from "@/trpc/react";

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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <AppBar
                  position="static"
                  elevation={0}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Toolbar>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1 }}
                    >
                      <Link
                        href="/"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        VideoBlade
                      </Link>
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button color="inherit" component={Link} href="/library">
                        Library
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        href="/platforms"
                      >
                        Platforms
                      </Button>
                      <Button color="inherit" component={Link} href="/upload">
                        Upload
                      </Button>
                    </Box>
                  </Toolbar>
                </AppBar>
                <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                  {children}
                </Container>
              </Box>
            </TRPCReactProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
