# Phase 3: Button & Badge 🔘

**Duration**: 2-3 hours | **Complexity**: Low-Medium | **Prerequisites**: Phase 1 Complete

---

## Overview

This phase migrates Button and Badge components from shadcn to Material-UI. Buttons are used extensively (6 files), making this a high-impact phase with straightforward mapping.

**Components to Migrate**:

- Button → MUI Button
- Badge → MUI Chip

**Files to Update** (7 total):

- `src/app/library/error.tsx`
- `src/app/library/page.tsx`
- `src/app/layout.tsx`
- `src/app/_components/video-card.tsx`
- `src/app/_components/ui/error-alert.tsx`
- `src/app/publish/[id]/page.tsx`
- `src/app/video/[id]/edit/page.tsx`

---

## Component Mapping

### Button Variants

| shadcn variant | MUI equivalent                          | Notes            |
| -------------- | --------------------------------------- | ---------------- |
| `default`      | `variant="contained"`                   | Solid background |
| `destructive`  | `variant="contained" color="error"`     | Red button       |
| `outline`      | `variant="outlined"`                    | Border, no fill  |
| `secondary`    | `variant="contained" color="secondary"` | Secondary color  |
| `ghost`        | `variant="text"`                        | No background    |
| `link`         | `variant="text"` + custom styling       | Underlined text  |

### Button Sizes

| shadcn size | MUI equivalent             | Notes            |
| ----------- | -------------------------- | ---------------- |
| `default`   | `size="medium"`            | Default          |
| `sm`        | `size="small"`             | Smaller          |
| `lg`        | `size="large"`             | Larger           |
| `icon`      | `size="medium"` IconButton | Icon-only button |

### Badge → Chip

| shadcn Badge            | MUI Chip             | Notes         |
| ----------------------- | -------------------- | ------------- |
| `variant="default"`     | `color="primary"`    | Primary color |
| `variant="secondary"`   | `color="secondary"`  | Secondary     |
| `variant="destructive"` | `color="error"`      | Red/error     |
| `variant="outline"`     | `variant="outlined"` | Border style  |

---

## Migration Examples

### Basic Button

**Before (shadcn)**:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Click Me
</Button>;
```

**After (MUI)**:

```tsx
import { Button } from "@mui/material";

<Button variant="contained" size="medium">
  Click Me
</Button>;
```

### Button with Icon

**Before (shadcn)**:

```tsx
<Button variant="destructive" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```

**After (MUI)**:

```tsx
import { IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

<IconButton color="error">
  <Delete />
</IconButton>;
```

### Badge/Chip

**Before (shadcn)**:

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="destructive">FAILED</Badge>;
```

**After (MUI)**:

```tsx
import { Chip } from "@mui/material";

<Chip label="FAILED" color="error" size="small" />;
```

---

## File-by-File Migration

### 1. Library Error Page

**File**: `src/app/library/error.tsx`

**Changes**:

- Import Button from `@mui/material`
- Update button variant

**Before**:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" onClick={() => reset()}>
  Try again
</Button>;
```

**After**:

```tsx
import { Button } from "@mui/material";

<Button variant="contained" onClick={() => reset()}>
  Try again
</Button>;
```

---

### 2. Library Page

**File**: `src/app/library/page.tsx`

**Changes**:

- Import Button from MUI
- May need additional layout changes if using buttons

---

### 3. Root Layout (Navigation)

**File**: `src/app/layout.tsx`

**Before**:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="ghost" asChild>
  <Link href="/library">Library</Link>
</Button>;
```

**After**:

```tsx
import { Button } from "@mui/material";
import Link from "next/link";

<Button component={Link} href="/library">
  Library
</Button>;
```

**Key Change**: MUI uses `component` prop instead of `asChild`

---

### 4. Video Card Component (Primary)

**File**: `src/app/_components/video-card.tsx`

This file has the most Button/Badge usage.

**Before**:

```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Upload } from "lucide-react";

// Status badge
<Badge variant={getStatusVariant(job.status)}>
  {job.platform}: {job.status}
</Badge>

// Action buttons
<Button
  className="flex-1"
  onClick={() => (window.location.href = `/publish/${video.id}`)}
>
  <Upload className="mr-2 h-4 w-4" />
  Publish
</Button>

<Button
  variant="outline"
  size="icon"
  onClick={() => (window.location.href = `/video/${video.id}/edit`)}
>
  <Edit className="h-4 w-4" />
</Button>

<Button
  variant="destructive"
  size="icon"
  onClick={handleDelete}
  disabled={isDeleting}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

**After**:

```tsx
import { Button, IconButton, Chip, Stack } from "@mui/material";
import { Delete, Edit, Upload } from "@mui/icons-material";

// Status badge
<Chip
  label={`${job.platform}: ${job.status}`}
  color={getStatusColor(job.status)}
  size="small"
/>

// Action buttons
<Stack direction="row" spacing={1}>
  <Button
    variant="contained"
    startIcon={<Upload />}
    onClick={() => (window.location.href = `/publish/${video.id}`)}
    sx={{ flex: 1 }}
  >
    Publish
  </Button>

  <IconButton
    color="default"
    onClick={() => (window.location.href = `/video/${video.id}/edit`)}
  >
    <Edit />
  </IconButton>

  <IconButton
    color="error"
    onClick={handleDelete}
    disabled={isDeleting}
  >
    <Delete />
  </IconButton>
</Stack>
```

**Helper Function Update**:

```tsx
// Before
const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default"; // green
    case "PROCESSING":
      return "secondary"; // blue
    case "FAILED":
      return "destructive"; // red
    case "PENDING":
      return "outline"; // neutral
    default:
      return "outline";
  }
};

// After
const getStatusColor = (
  status: string,
): "success" | "info" | "error" | "default" => {
  switch (status) {
    case "COMPLETED":
      return "success"; // green
    case "PROCESSING":
      return "info"; // blue
    case "FAILED":
      return "error"; // red
    case "PENDING":
      return "default"; // neutral
    default:
      return "default";
  }
};
```

---

### 5. Error Alert Component

**File**: `src/app/_components/ui/error-alert.tsx`

**Before**:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="sm" onClick={onRetry}>
  Try Again
</Button>;
```

**After**:

```tsx
import { Button } from "@mui/material";

<Button variant="outlined" size="small" onClick={onRetry}>
  Try Again
</Button>;
```

---

### 6. Publish Page

**File**: `src/app/publish/[id]/page.tsx`

**Before**:

```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Youtube } from "lucide-react";

<Button variant="ghost" onClick={() => router.push("/library")}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back
</Button>

<Badge variant="secondary">Connected</Badge>

<Button type="submit" disabled={isPublishing}>
  <Send className="mr-2 h-4 w-4" />
  Publish to YouTube
</Button>
```

**After**:

```tsx
import { Button, Chip, Stack } from "@mui/material";
import { ArrowBack, Send, YouTube } from "@mui/icons-material";

<Button startIcon={<ArrowBack />} onClick={() => router.push("/library")}>
  Back
</Button>

<Chip label="Connected" color="success" size="small" />

<Button
  type="submit"
  variant="contained"
  startIcon={<Send />}
  disabled={isPublishing}
>
  Publish to YouTube
</Button>
```

---

### 7. Edit Page (Buttons only - inputs done in Phase 2)

**File**: `src/app/video/[id]/edit/page.tsx`

**Already updated in Phase 2** - verify buttons work correctly.

---

## Icon Migration

### Lucide React → MUI Icons

Common icon mappings:

| Lucide Icon | MUI Icon    | Import                          |
| ----------- | ----------- | ------------------------------- |
| `Upload`    | `Upload`    | `@mui/icons-material/Upload`    |
| `Trash2`    | `Delete`    | `@mui/icons-material/Delete`    |
| `Edit`      | `Edit`      | `@mui/icons-material/Edit`      |
| `ArrowLeft` | `ArrowBack` | `@mui/icons-material/ArrowBack` |
| `Save`      | `Save`      | `@mui/icons-material/Save`      |
| `Send`      | `Send`      | `@mui/icons-material/Send`      |
| `Youtube`   | `YouTube`   | `@mui/icons-material/YouTube`   |

**Note**: Keep lucide-react for now - evaluate removal in Phase 6.

---

## MUI Button API Reference

### Variants

```tsx
<Button variant="contained">Contained</Button>  // Solid
<Button variant="outlined">Outlined</Button>    // Border
<Button variant="text">Text</Button>            // Minimal
```

### Colors

```tsx
<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="error">Error</Button>
<Button color="success">Success</Button>
<Button color="info">Info</Button>
<Button color="warning">Warning</Button>
```

### Sizes

```tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>  // Default
<Button size="large">Large</Button>
```

### With Icons

```tsx
<Button startIcon={<Upload />}>Upload</Button>
<Button endIcon={<ArrowForward />}>Next</Button>

<IconButton>
  <Delete />
</IconButton>
```

### As Link

```tsx
import Link from "next/link";

<Button component={Link} href="/page">
  Link Button
</Button>;
```

---

## MUI Chip API Reference

### Variants

```tsx
<Chip label="Default" />                      // Filled
<Chip label="Outlined" variant="outlined" />  // Border
```

### Colors

```tsx
<Chip label="Primary" color="primary" />
<Chip label="Success" color="success" />
<Chip label="Error" color="error" />
<Chip label="Warning" color="warning" />
<Chip label="Info" color="info" />
```

### Sizes

```tsx
<Chip label="Small" size="small" />
<Chip label="Medium" size="medium" />  // Default
```

### With Icon

```tsx
<Chip icon={<CheckCircle />} label="Completed" color="success" />
```

### Clickable

```tsx
<Chip label="Click me" onClick={handleClick} />
```

---

## Testing Checklist

### ✅ Functional Testing

- [ ] All buttons clickable
- [ ] Button states work (disabled, loading)
- [ ] Icon buttons trigger correct actions
- [ ] Links navigate to correct pages
- [ ] Badges/chips display correct status
- [ ] Delete confirmation works
- [ ] Form submissions work

### ✅ Visual Testing

- [ ] Button variants render correctly
- [ ] Button sizes appropriate
- [ ] Icons positioned correctly (start/end)
- [ ] Chips display status colors correctly
- [ ] Hover states visible
- [ ] Focus indicators visible
- [ ] Disabled state styled appropriately

### ✅ Dark Mode Testing

- [ ] Buttons visible in both modes
- [ ] Chips readable in both modes
- [ ] Hover/focus states work in both modes
- [ ] Color contrast meets WCAG 2.1 AA

### ✅ Responsive Testing

- [ ] Buttons stack properly on mobile
- [ ] Icon buttons sized correctly on all screens
- [ ] Touch targets ≥ 44x44px (mobile)

---

## Common Issues & Solutions

### Issue: Icon Not Showing

**Symptom**: Button appears without icon

**Solution**: Use `startIcon` or `endIcon` props, not children

### Issue: Link Button Doesn't Navigate

**Symptom**: Button click doesn't navigate

**Solution**: Use `component={Link} href="/path"`, not `onClick`

### Issue: IconButton Too Small

**Symptom**: Touch target too small on mobile

**Solution**: Use `size="medium"` or wrap in `<IconButton size="large">`

### Issue: Chip Color Not Applying

**Symptom**: Chip shows default color instead of specified

**Solution**: Check color value matches MUI palette (primary, secondary, error, etc.)

---

## Accessibility Notes

### ✅ Button Accessibility

```tsx
// Icon-only buttons need aria-label
<IconButton aria-label="delete video">
  <Delete />
</IconButton>

// Describe button action
<Button aria-describedby="tooltip-id">
  Submit
</Button>
```

### ✅ Keyboard Navigation

- Tab: Focus next button
- Shift+Tab: Focus previous button
- Enter/Space: Activate button
- All built-in with MUI Button

---

## Phase Completion Criteria

- [ ] All Button components migrated to MUI
- [ ] All Badge components migrated to Chip
- [ ] Icon buttons use IconButton component
- [ ] Icons use MUI icons-material (or lucide temporarily)
- [ ] Button variants map correctly
- [ ] Chip colors indicate status correctly
- [ ] No TypeScript errors
- [ ] All buttons functional
- [ ] Dark mode works correctly
- [ ] Responsive on all screen sizes

---

## Next Phase

Once Phase 3 is complete, proceed to:
📄 **[Phase 4: Select Component](./MUI_MIGRATION_PHASE_4_SELECT.md)**

---

**Phase 3 Status**: Button & Badge Complete ✅
