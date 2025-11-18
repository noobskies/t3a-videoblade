"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import theme from "@/theme/theme";
import Link from "next/link";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                flexGrow: 1,
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
              }}
            >
              VideoBlade
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={Link} href="/library">
                Library
              </Button>
              <Button component={Link} href="/platforms">
                Platforms
              </Button>
              <Button component={Link} href="/upload">
                Upload
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
