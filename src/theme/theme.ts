import { createTheme } from "@mui/material/styles";

// Map current OKLCH colors to RGB/HEX for MUI
const theme = createTheme({
  cssVariables: true, // Enable CSS variables
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#333333", // oklch(0.205 0 0) → dark gray
          contrastText: "#fafafa", // oklch(0.985 0 0) → near white
        },
        secondary: {
          main: "#f7f7f7", // oklch(0.97 0 0) → light gray
          contrastText: "#333333",
        },
        error: {
          main: "#ef4444", // oklch(0.577 0.245 27.325) → red
        },
        warning: {
          main: "#f59e0b", // amber
        },
        info: {
          main: "#3b82f6", // blue
        },
        success: {
          main: "#10b981", // green
        },
        background: {
          default: "#ffffff", // oklch(1 0 0)
          paper: "#ffffff",
        },
        text: {
          primary: "#262626", // oklch(0.145 0 0)
          secondary: "#737373", // oklch(0.556 0 0)
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#ebebeb", // oklch(0.922 0 0) → light gray
          contrastText: "#333333", // oklch(0.205 0 0)
        },
        secondary: {
          main: "#454545", // oklch(0.269 0 0) → dark gray
          contrastText: "#fafafa",
        },
        error: {
          main: "#f87171", // oklch(0.704 0.191 22.216) → lighter red
        },
        warning: {
          main: "#fbbf24",
        },
        info: {
          main: "#60a5fa",
        },
        success: {
          main: "#34d399",
        },
        background: {
          default: "#262626", // oklch(0.145 0 0)
          paper: "#333333", // oklch(0.205 0 0)
        },
        text: {
          primary: "#fafafa", // oklch(0.985 0 0)
          secondary: "#b5b5b5", // oklch(0.708 0 0)
        },
      },
    },
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    button: {
      textTransform: "none", // Don't uppercase buttons
    },
  },
  shape: {
    borderRadius: 10, // 0.625rem = 10px (from current --radius)
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640, // Tailwind sm
      md: 768, // Tailwind md
      lg: 1024, // Tailwind lg
      xl: 1280, // Tailwind xl
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded (adjust as needed)
        },
      },
    },
  },
});

export default theme;
