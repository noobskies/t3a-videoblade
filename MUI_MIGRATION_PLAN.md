# MUI Migration Plan: t3a-videoblade

## 1. Executive Summary

**Objective**: Complete UI overhaul migrating from shadcn/ui (Tailwind CSS) + Lucide Icons to **Material-UI v6 (MUI)** + **Material Icons**.

**Strategy**: "Clean Break" - We will replace components entirely rather than attempting to shim shadcn APIs. This ensures full leverage of MUI's theming and accessibility features without technical debt.

**Architecture**:

- **Framework**: Material-UI v6 (Emotion engine)
- **Icons**: `@mui/icons-material`
- **Theming**: CSS Variables (`cssVariables: true`) + Native Dark Mode
- **Integration**: Next.js 15 App Router (`AppRouterCacheProvider`)

**Timeline**: 8 Phases (Linear execution)

---

## 2. MUI Documentation Insights & Architecture

Based on analysis of the latest MUI v6 documentation and Next.js 15 requirements:

### Core Architecture

- **Provider Setup**: Next.js 15 requires wrapping the root layout with `AppRouterCacheProvider` (from `@mui/material-nextjs/v15-appRouter`) to handle SSR cache generation.
- **Theming Engine**: We will use the new `cssVariables: true` feature. This generates CSS variables for the palette (e.g., `--mui-palette-primary-main`), making the theme compatible with external CSS if needed and improving performance.
- **Dark Mode**: We will use the native `colorSchemes` feature (`light` and `dark` keys) which provides built-in dark mode support without complex state management.

### Styling Strategy

1.  **`sx` Prop (Primary)**: Use for one-off styles and layout.
    - _Why_: Fastest development speed, type-safe, access to theme values.
    - _Example_: `<Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>`
2.  **`styled()` API (Secondary)**: Use for reusable custom components where `sx` becomes too verbose.
    - _Why_: cleaner JSX, better performance for highly repeated components.
3.  **Grid v2**: We will use the new `Grid2` (import as `Grid`) which fixes many layout issues of v1.

### Component Mapping

| Component  | shadcn / Current         | MUI v6 Equivalent                   | Notes                                              |
| :--------- | :----------------------- | :---------------------------------- | :------------------------------------------------- |
| **Layout** | `div` + Tailwind classes | `Box`, `Stack`, `Container`, `Grid` | Use `Container` for page constraints.              |
| **Button** | `Button`                 | `Button`                            | Variants: `contained`, `outlined`, `text`.         |
| **Card**   | `Card`                   | `Card`                              | Use `CardHeader`, `CardContent`, `CardActions`.    |
| **Input**  | `Input`                  | `TextField`                         | Variant: `outlined`.                               |
| **Label**  | `Label`                  | `InputLabel` / `Typography`         | Usually built into `TextField`.                    |
| **Select** | `Select`                 | `TextField` (select)                | Easier API than raw `Select`.                      |
| **Badge**  | `Badge`                  | `Chip` or `Badge`                   | `Chip` for status tags, `Badge` for notifications. |
| **Icons**  | Lucide React             | `@mui/icons-material`               | Full replacement.                                  |

---

## 3. Current State Assessment

**Audit Findings**:

- **Dependencies**: `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`.
- **Components**: 7 shadcn components in `src/components/ui`.
- **Usage**: ~16 files importing from `@/components/ui`.
- **Styles**: Heavy reliance on `src/styles/globals.css` for CSS variables.

**Technical Debt to Address**:

- Remove `src/styles/globals.css` complexity (let MUI handle it).
- Remove Tailwind config and dependencies.
- Remove all `lucide-react` imports.

---

## 4. Phased Implementation Roadmap

**Constraint**: Each phase must be ~150-200 lines of code to stay within context limits.

### Phase 1: Foundation & Configuration

**Goal**: Install MUI and set up the global theme provider.

1.  **Uninstall**: Remove `lucide-react` (temporarily break build) to force migration, or keep until end. _Decision: Keep until Phase 8 to allow reference, but install MUI now._
2.  **Install**: `npm install @mui/material @mui/material-nextjs @emotion/react @emotion/styled @mui/icons-material`
3.  **Font**: Install `@fontsource/roboto`.
4.  **Theme**: Create `src/theme.ts` with `cssVariables: true` and dark mode.
5.  **Layout**: Update `src/app/layout.tsx` to include `AppRouterCacheProvider` and `ThemeProvider`.
6.  **Sanity Check**: Ensure app runs (even if styles are mixed).

### Phase 2: Core Layout Migration

**Goal**: Migrate the application shell (Navbar, Footer, Global Container).

1.  **Navbar**: Replace Tailwind navbar in `src/app/layout.tsx` with MUI `AppBar` + `Toolbar`.
2.  **Navigation**: Replace generic links with MUI `Button` (text variant) or `Link`.
3.  **Global Styles**: Remove body styles from `globals.css`, use `CssBaseline` in layout.
4.  **Icons**: Replace Lucide icons in navbar with Material Icons.

### Phase 3: Generic UI Components

**Goal**: Migrate shared utility components.

1.  **AuthButton**: Migrate `src/app/_components/auth-button.tsx`.
    - Use MUI `Button` and `Avatar`.
    - Replace dropdown (if any) with MUI `Menu`.
2.  **ErrorAlert**: Migrate `src/app/_components/ui/error-alert.tsx`.
    - Use MUI `Alert` component (perfect match).
3.  **LoadingSkeleton**: Migrate `src/app/_components/ui/loading-skeleton.tsx`.
    - Use MUI `Skeleton` component.

### Phase 4: Feature - Library

**Goal**: Migrate the main dashboard/library view.

1.  **VideoCard**: Revamp `src/app/_components/video-card.tsx`.
    - `Card` -> `MuiCard`.
    - `Badge` -> `Chip` (size="small").
    - Lucide Icons -> Material Icons (e.g., `PlayArrow`, `Edit`, `Delete`).
2.  **Library Page**: Revamp `src/app/library/page.tsx`.
    - Grid Layout: Use MUI `Grid` (spacing={2} or {3}).
    - Empty State: Use `Stack` with `Typography` and `Button`.

### Phase 5: Feature - Upload

**Goal**: Migrate the upload flow.

1.  **VideoUpload**: Revamp `src/app/_components/video-upload.tsx`.
    - Dropzone area: Use `Box` with dashed border (`sx={{ borderStyle: 'dashed' }}`).
    - Progress: Use MUI `LinearProgress`.
    - Form: `TextField` for filename (read-only).
    - Icons: `CloudUpload` icon.
2.  **Upload Page**: Revamp `src/app/upload/page.tsx`.
    - Container layout.

### Phase 6: Feature - Edit (Forms)

**Goal**: Migrate the complex editing form.

1.  **Edit Page**: Revamp `src/app/video/[id]/edit/page.tsx`.
    - **Title**: `TextField`.
    - **Description**: `TextField` (multiline, rows={4}).
    - **Privacy**: `TextField` (select=true) or `FormControl` + `Select`.
    - **Tags**: `TextField` (helperText for character count).
    - **Actions**: `Stack` for Save/Cancel buttons.
    - **Validation**: Ensure error props on `TextField` map to existing validation.

### Phase 7: Feature - Publish & Platforms

**Goal**: Migrate remaining features.

1.  **Publish Page**: Revamp `src/app/publish/[id]/page.tsx`.
    - Platform Selection: `Card` with selection state (or `ToggleButton`).
    - Status Badge: `Chip`.
2.  **Platforms Page**: Revamp `src/app/platforms/page.tsx`.
    - Connection Cards: `Card` with `CardHeader` (avatar for platform logo).
    - Connect/Disconnect buttons.

### Phase 8: Cleanup & Polish

**Goal**: Remove legacy code.

1.  **Delete**: `src/components/ui` folder (shadcn).
2.  **Uninstall**: `lucide-react`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.
3.  **Clean**: `globals.css` (remove Tailwind directives, keep only minimal resets if needed).
4.  **Config**: Delete `tailwind.config.ts`, `postcss.config.js`.

---

## 5. UI/UX Best Practices Checklist

- [ ] **Accessibility**:
  - Ensure all icon-only buttons have `aria-label`.
  - Use `component="h1"` etc. on Typography to maintain heading hierarchy visually vs semantically.
- [ ] **Responsive Design**:
  - Use `sx={{ flexDirection: { xs: 'column', md: 'row' } }}` patterns.
  - Use `Container` to constrain max-width on large screens.
- [ ] **Dark Mode**:
  - Verify all custom colors use theme variables (e.g., `theme.palette.background.paper`) so they adapt automatically.
- [ ] **Performance**:
  - Use `next/font` for Roboto.
  - Ensure `AppRouterCacheProvider` is working (view source -> look for Emotion styles).

## 6. Risk Assessment

| Risk                   | Mitigation                                                                                                                                                                                                    |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hydration Mismatch** | Use `AppRouterCacheProvider` and `InitColorSchemeScript` carefully.                                                                                                                                           |
| **Lost Styles**        | "Clean Break" strategy means we rebuild styles from scratch. Visual regression is expected but intended (new look).                                                                                           |
| **Bundle Size**        | Ensure tree-shaking works by using direct imports (e.g., `import Button from '@mui/material/Button'`) or relies on deep imports being handled by bundler. _Note: MUI v6 is mostly tree-shakeable by default._ |

## 7. Success Metrics

- **Build**: Pass `npm run build` with zero errors.
- **Visuals**: Application looks consistent (Material Design language) across all pages.
- **Functionality**: All features (Upload, Edit, Publish) work without regression.
- **Clean**: No traces of Tailwind classes (`className="flex..."`) remaining in the code.
