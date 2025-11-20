"use client";

import { createTheme, alpha } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#4f46e5", // Indigo 600
          light: "#818cf8",
          dark: "#3730a3",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#0d9488", // Teal 600
          light: "#2dd4bf",
          dark: "#0f766e",
        },
        background: {
          default: "#f8fafc", // Slate 50
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a", // Slate 900
          secondary: "#475569", // Slate 600
        },
        divider: alpha("#0f172a", 0.08),
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#6366f1", // Indigo 500
          light: "#818cf8",
          dark: "#4338ca",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#14b8a6", // Teal 500
          light: "#2dd4bf",
          dark: "#0f766e",
        },
        background: {
          default: "#0f172a", // Slate 900
          paper: "#1e293b", // Slate 800
        },
        text: {
          primary: "#f8fafc", // Slate 50
          secondary: "#94a3b8", // Slate 400
        },
        divider: alpha("#ffffff", 0.08),
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 600 },
    h5: { fontSize: "1.25rem", fontWeight: 600 },
    h6: { fontSize: "1rem", fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#4338ca", // Indigo 700
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Disable default dark mode overlay
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "var(--mui-palette-divider)",
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid var(--mui-palette-divider)",
        },
      },
    },
  },
});

export default theme;
