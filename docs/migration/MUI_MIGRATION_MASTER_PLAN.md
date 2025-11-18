# Material-UI Migration Master Plan

## Executive Summary

This document outlines the complete migration strategy from shadcn UI to Material-UI (MUI) v6 for the VideoBlade project. This is a **complete replacement** with zero backward compatibility - we're fully embracing MUI's ecosystem and best practices.

---

## Why Material-UI?

### Strategic Advantages

1. **Enterprise Maturity**: 10+ years in production, trusted by thousands of companies
2. **Comprehensive Library**: 50+ production-ready components vs 7 custom shadcn components
3. **Built-in Theming**: Theme-aware components without CSS variable complexity
4. **Accessibility First**: WCAG 2.1 AA compliance built-in
5. **TypeScript Native**: Full type safety without wrapper complexity
6. **Zero-Config Dark Mode**: Automatic with `colorSchemes` API
7. **Performance**: Optimized rendering, tree-shaking, smaller runtime
8. **Framework Integration**: Native Next.js 15 support, SSR ready

### Technical Benefits

- **sx prop**: Theme-aware styling that's concise like Tailwind but type-safe
- **Color Schemes API**: Automatic light/dark mode without manual CSS management
- **Responsive System**: Built-in breakpoints with mobile-first approach
- **Composition Patterns**: Consistent component hierarchies (Card → Header/Content/Actions)
- **Icon System**: @mui/icons-material with 2000+ icons included
- **Form Integration**: react-hook-form compatibility out of the box

---

## Current State Analysis

### shadcn Components (7 Total)

| Component | Usage Count | Complexity | Priority |
| --------- | ----------- | ---------- | -------- |
| Button    | 6 files     | Low        | High     |
| Card      | 2 files     | High       | High     |
| Badge     | 2 files     | Low        | Medium   |
| Input     | 2 files     | Low        | High     |
| Textarea  | 1 file      | Low        | Medium   |
| Label     | 1 file      | Low        | Medium   |
| Select    | 1 file      | Medium     | Medium   |

### Current Architecture

**Styling**: Tailwind CSS with CSS variables
**Theming**: OKLCH color space, manual dark mode via `.dark` class
**Dependencies**: Radix UI primitives, class-variance-authority
**Pattern**: Utility-first with composition

### Usage Patterns

- **Video Library**: Card, Badge, Button (high density)
- **Edit Form**: Input, Textarea, Label, Select, Button
- **Publish Page**: Card, Button, Badge
- **Error Boundaries**: Button
- **Layout**: Button (navigation)

---

## Migration Architecture

### Styling Strategy: `sx` Prop (Primary)

**Why sx prop?**

- Most aligned with MUI best practices
- Theme-aware (colors, spacing, typography, breakpoints)
- TypeScript autocomplete
- No separate style files needed
- Performance optimized
- Easy migration from Tailwind patterns

**Example**:

```tsx
// Before (Tailwind)
<Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
  Click Me
</Button>

// After (MUI sx)
<Button
  sx={{
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    px: 2,
    py: 1,
    borderRadius: 1,
    '&:hover': { bgcolor: 'primary.dark' }
  }}
>
  Click Me
</Button>
```

**When to Use `styled()`**: Only for complex reusable components with heavy styling logic.

### Theme Structure

```typescript
// Light/Dark automatic with colorSchemes
const theme = createTheme({
  colorSchemes: {
    light: {
      /* light palette */
    },
    dark: {
      /* dark palette */
    },
  },
  typography: {
    /* font config */
  },
  shape: { borderRadius: 10 },
  breakpoints: {
    /* responsive values */
  },
});
```

### Component Mapping

| shadcn   | MUI                   | Mapping Type |
| -------- | --------------------- | ------------ |
| Button   | Button                | 1:1 Direct   |
| Badge    | Chip                  | Equivalent   |
| Card     | Card + sub-components | Composition  |
| Input    | TextField             | Enhanced     |
| Label    | FormLabel / TextField | Embedded     |
| Textarea | TextField (multiline) | Config       |
| Select   | Select + MenuItem     | Composition  |

---

## 6-Phase Migration Strategy

I've designed **6 focused phases** based on dependency order, complexity level, and usage frequency. Each phase is independently testable and stays within context limits.

### **Phase 1: Foundation Setup** ⚙️

**Duration**: 2-3 hours | **Complexity**: Medium

**Scope**:

- Install MUI packages (@mui/material, @emotion/react, @emotion/cache)
- Create theme with color schemes (light/dark)
- Configure ThemeProvider in root layout
- Set up emotion cache for Next.js SSR
- Remove Tailwind dependencies
- Update tsconfig for emotion

**Deliverable**: MUI fully configured, dark mode working automatically

📄 **Document**: [`MUI_MIGRATION_PHASE_1_FOUNDATION.md`](./MUI_MIGRATION_PHASE_1_FOUNDATION.md)

---

### **Phase 2: Core Inputs** 📝

**Duration**: 1-2 hours | **Complexity**: Low

**Scope**:

- Migrate Input → TextField
- Migrate Label → FormLabel (where needed)
- Migrate Textarea → TextField (multiline)

**Files Updated**:

- `src/app/video/[id]/edit/page.tsx` (edit form)
- `src/app/upload/page.tsx` (upload form - if applicable)

**Why First**: Simplest components, foundational for forms, no composition complexity

📄 **Document**: [`MUI_MIGRATION_PHASE_2_INPUTS.md`](./MUI_MIGRATION_PHASE_2_INPUTS.md)

---

### **Phase 3: Button & Badge** 🔘

**Duration**: 2-3 hours | **Complexity**: Low-Medium

**Scope**:

- Migrate Button → MUI Button (6 files)
- Migrate Badge → MUI Chip (2 files)
- Map variants correctly

**Files Updated**:

- `src/app/library/error.tsx`
- `src/app/library/page.tsx`
- `src/app/layout.tsx`
- `src/app/_components/video-card.tsx`
- `src/app/_components/ui/error-alert.tsx`
- `src/app/publish/[id]/page.tsx`
- `src/app/video/[id]/edit/page.tsx`

**Why Second**: High usage, simple mapping, no composition, big visual impact

📄 **Document**: [`MUI_MIGRATION_PHASE_3_BUTTON_BADGE.md`](./MUI_MIGRATION_PHASE_3_BUTTON_BADGE.md)

---

### **Phase 4: Select Component** 🔽

**Duration**: 1-2 hours | **Complexity**: Medium

**Scope**:

- Migrate Select → MUI Select + MenuItem
- Add FormControl wrapper
- Handle privacy dropdown

**Files Updated**:

- `src/app/video/[id]/edit/page.tsx` (privacy dropdown)

**Why Third**: Moderate complexity, important form component, single file scope

📄 **Document**: [`MUI_MIGRATION_PHASE_4_SELECT.md`](./MUI_MIGRATION_PHASE_4_SELECT.md)

---

### **Phase 5: Card Composition** 🃏

**Duration**: 3-4 hours | **Complexity**: High

**Scope**:

- Migrate Card → MUI Card
- Migrate CardHeader → MUI CardHeader + Typography
- Migrate CardContent → MUI CardContent
- Migrate CardFooter → MUI CardActions
- Migrate CardTitle → Typography variant
- Migrate CardDescription → Typography variant
- Handle CardAction placement

**Files Updated**:

- `src/app/_components/video-card.tsx` (primary Card usage)
- `src/app/publish/[id]/page.tsx` (platform selection card)

**Why Fourth**: Most complex, requires composition refactoring, central to UI

📄 **Document**: [`MUI_MIGRATION_PHASE_5_CARD.md`](./MUI_MIGRATION_PHASE_5_CARD.md)

---

### **Phase 6: Layout & Polish** ✨

**Duration**: 2-3 hours | **Complexity**: Medium

**Scope**:

- Introduce Container for page width constraints
- Replace manual flexbox with Stack component
- Add Grid for responsive layouts
- Accessibility audit (ARIA labels, keyboard navigation)
- Performance optimization (bundle analysis)
- Remove unused Tailwind utilities
- Update documentation

**Files Updated**: Various (global improvements)

**Why Last**: Cleanup phase, enhancements, final polish

📄 **Document**: [`MUI_MIGRATION_PHASE_6_POLISH.md`](./MUI_MIGRATION_PHASE_6_POLISH.md)

---

## Timeline & Effort

| Phase                 | Duration        | Complexity    | Dependencies |
| --------------------- | --------------- | ------------- | ------------ |
| Phase 1: Foundation   | 2-3 hours       | Medium        | None         |
| Phase 2: Inputs       | 1-2 hours       | Low           | Phase 1      |
| Phase 3: Button/Badge | 2-3 hours       | Low-Med       | Phase 1      |
| Phase 4: Select       | 1-2 hours       | Medium        | Phase 1, 2   |
| Phase 5: Card         | 3-4 hours       | High          | Phase 1, 3   |
| Phase 6: Polish       | 2-3 hours       | Medium        | All previous |
| **TOTAL**             | **11-17 hours** | **~2-3 days** | Sequential   |

---

## Success Criteria

### ✅ Functional Requirements

- [ ] Zero Tailwind CSS utility classes in codebase
- [ ] All 7 shadcn components replaced with MUI equivalents
- [ ] Dark mode toggles automatically via MUI color schemes
- [ ] No visual regressions from original design
- [ ] All user interactions functional (buttons, forms, cards)
- [ ] Responsive design works on mobile, tablet, desktop

### ✅ Technical Requirements

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Build: Successful production build
- [ ] Bundle Size: ≤ +50KB gzipped increase
- [ ] Dependencies: All Radix UI and Tailwind packages removed

### ✅ Performance Targets

- [ ] First Contentful Paint (FCP): < 1.5s
- [ ] Time to Interactive (TTI): < 3.5s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Cumulative Layout Shift (CLS): < 0.1

### ✅ Accessibility (WCAG 2.1 AA)

- [ ] Color contrast ratios: ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- [ ] Keyboard navigation: All interactive elements accessible
- [ ] Screen reader: Proper ARIA labels and roles
- [ ] Focus indicators: Visible focus states on all controls

### ✅ Quality Assurance

- [ ] All pages render correctly
- [ ] Forms submit successfully
- [ ] Video cards display properly
- [ ] Navigation works
- [ ] Dark mode switches without flicker
- [ ] Responsive breakpoints tested (320px, 768px, 1024px, 1440px)

---

## Risk Assessment & Mitigation

| Risk                        | Probability | Impact | Mitigation Strategy                                            |
| --------------------------- | ----------- | ------ | -------------------------------------------------------------- |
| **Learning Curve**          | Medium      | Medium | Comprehensive docs, MUI examples, Context7 available           |
| **Breaking Visual Changes** | High        | High   | ACCEPTED - Complete redesign, screenshot comparisons           |
| **Bundle Size Growth**      | Low         | Low    | Tree-shaking enabled, emotion optimized, monitor build         |
| **TypeScript Errors**       | Low         | Low    | Strong MUI types, incremental migration, test per phase        |
| **Dark Mode Complexity**    | Low         | Low    | MUI handles automatically via colorSchemes                     |
| **Time Overrun**            | Medium      | Medium | Buffer in estimates (11-17hr range), phases are parallelizable |
| **Component API Misuse**    | Medium      | Low    | Phase documents include best practices, examples               |

---

## Best Practices & Recommendations

### 🎨 **Styling**

1. ✅ Use `sx` prop as primary styling method
2. ✅ Use theme values (spacing, colors, breakpoints) - avoid magic numbers
3. ✅ Use responsive objects in sx: `{ xs: value, md: value }`
4. ❌ Avoid inline styles or separate CSS files

### 🎭 **Theming**

1. ✅ Define complete colorSchemes (light + dark)
2. ✅ Use semantic color tokens (primary, secondary, error)
3. ✅ Leverage theme.palette, theme.typography, theme.spacing
4. ❌ Don't hardcode colors or sizes

### 🧩 **Components**

1. ✅ Import from `@mui/material` for tree-shaking
2. ✅ Use composition (Card → CardHeader/Content/Actions)
3. ✅ Leverage built-in variants and sizes
4. ❌ Don't create custom wrappers unless necessary

### ♿ **Accessibility**

1. ✅ Use semantic HTML (Button not div with onClick)
2. ✅ Add aria-label for icon-only buttons
3. ✅ Ensure keyboard navigation (Tab, Enter, Space)
4. ✅ Test with screen reader (NVDA/JAWS)

### 📱 **Responsive Design**

1. ✅ Mobile-first breakpoints (xs → sm → md → lg → xl)
2. ✅ Use Stack with responsive spacing
3. ✅ Use Grid with responsive columns
4. ✅ Test on real devices, not just browser DevTools

### ⚡ **Performance**

1. ✅ Enable tree-shaking (import from package root)
2. ✅ Use React.memo for expensive components
3. ✅ Lazy load icons: `import('@mui/icons-material/Add')`
4. ❌ Don't import entire icon library

---

## Testing Strategy

### Per-Phase Testing

**After Each Phase**:

1. ✅ Visual inspection (light + dark mode)
2. ✅ Functional testing (clicks, forms, navigation)
3. ✅ TypeScript compilation (`npm run typecheck`)
4. ✅ ESLint (`npm run lint`)
5. ✅ Build test (`npm run build`)

### End-to-End Testing

**After All Phases**:

1. ✅ Complete user flows (upload → edit → publish)
2. ✅ Responsive testing (mobile, tablet, desktop)
3. ✅ Dark mode toggle testing
4. ✅ Accessibility audit (axe DevTools)
5. ✅ Performance audit (Lighthouse)
6. ✅ Cross-browser testing (Chrome, Firefox, Safari)

---

## Rollback Plan

**If Critical Issues Arise**:

1. **Immediate Rollback**: Each phase is a separate commit - use `git revert <commit>`
2. **Partial Rollback**: Cherry-pick working phases, rollback problematic ones
3. **Full Rollback**: Revert to commit before Phase 1 start

**Prevention**:

- Test each phase thoroughly before proceeding
- Commit after each phase completion
- Keep main branch stable (work in feature branch)

---

## Post-Migration Tasks

### Documentation Updates

- [ ] Update component usage guide for team
- [ ] Document new theming approach
- [ ] Create MUI component examples
- [ ] Update developer onboarding docs

### Codebase Cleanup

- [ ] Remove `src/components/ui/` directory (old shadcn)
- [ ] Remove Tailwind CSS config files
- [ ] Remove unused dependencies (Radix UI, CVA)
- [ ] Remove Tailwind utility imports
- [ ] Clean up package.json

### Team Training

- [ ] Share MUI documentation links
- [ ] Demo sx prop patterns
- [ ] Review theme usage
- [ ] Explain responsive breakpoints

---

## Phase Documents

Each phase has a dedicated document with:

- Detailed implementation steps
- Before/After code examples
- MUI API reference
- Accessibility considerations
- Testing checklist
- Common pitfalls

📄 **Phase 1**: [Foundation Setup](./MUI_MIGRATION_PHASE_1_FOUNDATION.md)
📄 **Phase 2**: [Core Inputs](./MUI_MIGRATION_PHASE_2_INPUTS.md)
📄 **Phase 3**: [Button & Badge](./MUI_MIGRATION_PHASE_3_BUTTON_BADGE.md)
📄 **Phase 4**: [Select Component](./MUI_MIGRATION_PHASE_4_SELECT.md)
📄 **Phase 5**: [Card Composition](./MUI_MIGRATION_PHASE_5_CARD.md)
📄 **Phase 6**: [Layout & Polish](./MUI_MIGRATION_PHASE_6_POLISH.md)

---

## Getting Started

1. ✅ Review this master plan thoroughly
2. ✅ Read Phase 1 document
3. ✅ Create feature branch: `git checkout -b feature/mui-migration`
4. ✅ Begin Phase 1 implementation
5. ✅ Test and commit after each phase
6. ✅ Merge to main when all phases complete

---

## Questions & Support

- **MUI Documentation**: https://mui.com/material-ui/getting-started/
- **MUI GitHub**: https://github.com/mui/material-ui
- **Context7 MCP**: Use `context7` tool for live documentation queries
- **Memory Bank**: Update `activeContext.md` with migration progress

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Status**: PLANNING COMPLETE - READY FOR IMPLEMENTATION
