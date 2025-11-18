# Phase 1: Foundation Setup ⚙️

**Duration**: 2-3 hours | **Complexity**: Medium | **Prerequisites**: None

---

## Overview

This phase establishes the Material-UI foundation by installing packages, configuring the theme system, setting up the ThemeProvider, and preparing the application for SSR-compatible styling with Emotion.

**Goals**:

- Install MUI and Emotion packages
- Create theme with automatic dark/light color schemes
- Configure ThemeProvider in root layout
- Set up Emotion cache for Next.js SSR
- Remove Tailwind CSS dependencies
- Update TypeScript configuration

---

## Step 1: Install Dependencies

### Install MUI Packages

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material  # Optional: for icon library
```

### Install Emotion Cache for Next.js

```bash
npm install @emotion/cache
```

### Remove Tailwind Dependencies

```bash
npm uninstall tailwindcss postcss autoprefixer @tailwindcss/postcss tw-animate-css
npm uninstall @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

**Note**: Keep `lucide-react` for now (icons) - we'll evaluate in Phase 6.

---

## Step 2: Create Theme Configuration

### Create Theme File

**File**: `src/theme/theme.ts`

```typescript
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
```

---

## Step 3: Create Emotion Cache for SSR

### Create Cache Configuration

**File**: `src/theme/createEmotionCache.ts`

```typescript
import createCache from "@emotion/cache";

export default function createEmotionCache() {
  return createCache({ key: "css", prepend: true });
}
```

---

## Step 4: Update Root Layout with ThemeProvider

### Modify Root Layout

**File**: `src/app/layout.tsx`

```tsx
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";

export const metadata: Metadata = {
  title: "VideoBlade",
  description: "Multi-platform video publishing tool",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

**Key Changes**:

1. ✅ Wrapped app with `AppRouterCacheProvider` (Emotion SSR)
2. ✅ Wrapped app with `ThemeProvider` (MUI theme)
3. ✅ Added `CssBaseline` (MUI base styles, replaces Tailwind reset)
4. ✅ Added `suppressHydrationWarning` to html tag (for SSR)
5. ❌ Removed Tailwind imports
6. ❌ Removed custom CSS imports

---

## Step 5: Install MUI Next.js Integration

### Install Package

```bash
npm install @mui/material-nextjs
```

This package provides:

- `AppRouterCacheProvider` for Emotion SSR
- Automatic cache extraction for Next.js

---

## Step 6: Remove Tailwind Configuration

### Delete Files

```bash
rm postcss.config.js
rm src/styles/globals.css
```

### Update TypeScript Config (Optional)

**File**: `tsconfig.json`

Add Emotion JSX pragma (if using emotion's `css` prop):

```json
{
  "compilerOptions": {
    "jsxImportSource": "@emotion/react"
  }
}
```

**Note**: Only needed if you plan to use Emotion's `css` prop directly. For MUI `sx` prop, this is not required.

---

## Step 7: Verify Theme Works

### Create Test Page (Optional)

**File**: `src/app/test-theme/page.tsx`

```tsx
"use client";

import { Box, Button, Typography, useTheme } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";

export default function TestThemePage() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        MUI Theme Test
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Current mode: {mode}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => setMode("light")}>
          Light Mode
        </Button>
        <Button variant="contained" onClick={() => setMode("dark")}>
          Dark Mode
        </Button>
        <Button variant="contained" onClick={() => setMode("system")}>
          System Mode
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" color="error">
          Error
        </Button>
        <Button variant="outlined" color="primary">
          Outlined
        </Button>
        <Button variant="text" color="primary">
          Text
        </Button>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="body2">
          Background: {theme.palette.background.default}
        </Typography>
        <Typography variant="body2">
          Text: {theme.palette.text.primary}
        </Typography>
      </Box>
    </Box>
  );
}
```

Visit `/test-theme` to verify:

- ✅ Theme loads correctly
- ✅ Dark mode toggles work
- ✅ Colors match design
- ✅ No hydration errors

---

## Step 8: Clean Up Package.json

### Remove Unused Scripts

Update `package.json` to remove Tailwind-related scripts if any.

---

## Testing Checklist

### ✅ Build & Type Check

```bash
npm run typecheck  # Should pass with 0 errors
npm run build      # Should build successfully
npm run dev        # Should start without errors
```

### ✅ Visual Verification

1. Navigate to `/test-theme` page
2. Toggle between light/dark modes
3. Verify buttons render correctly
4. Check browser console for errors (should be none)
5. Verify no hydration warnings

### ✅ Theme Verification

- [ ] Light mode colors match design intent
- [ ] Dark mode colors match design intent
- [ ] Mode toggle works without flicker
- [ ] Font family loads correctly (Geist Sans)
- [ ] Border radius matches design (10px)
- [ ] No console errors or warnings

---

## Common Issues & Solutions

### Issue: Hydration Mismatch

**Symptom**: Console warning about text content mismatch

**Solution**: Ensure `suppressHydrationWarning` is on `<html>` tag

### Issue: Dark Mode Not Persisting

**Symptom**: Mode resets to light on refresh

**Solution**: MUI automatically persists mode to localStorage. Ensure `cssVariables: true` in theme.

### Issue: Fonts Not Loading

**Symptom**: Fallback fonts showing instead of Geist Sans

**Solution**: Verify `GeistSans.variable` is applied to html tag

### Issue: Build Fails with Emotion Error

**Symptom**: Build error mentioning `@emotion/cache`

**Solution**: Ensure `@mui/material-nextjs` is installed and `AppRouterCacheProvider` wraps the app

---

## Phase Completion Criteria

- [ ] All MUI packages installed
- [ ] Theme file created with light/dark color schemes
- [ ] ThemeProvider configured in root layout
- [ ] Emotion cache set up for SSR
- [ ] Tailwind CSS removed completely
- [ ] Application builds successfully
- [ ] No TypeScript errors
- [ ] Dark mode toggle works
- [ ] Test page renders correctly

---

## Next Phase

Once Phase 1 is complete and verified, proceed to:
📄 **[Phase 2: Core Inputs](./MUI_MIGRATION_PHASE_2_INPUTS.md)**

---

**Phase 1 Status**: Foundation Complete ✅
