# Phase 2: Core Inputs 📝

**Duration**: 1-2 hours | **Complexity**: Low | **Prerequisites**: Phase 1 Complete

---

## Overview

This phase migrates form input components from shadcn to Material-UI TextField components. MUI's TextField combines Input, Label, and helper text into a single powerful component.

**Components to Migrate**:

- Input → TextField
- Label → FormLabel (or embedded in TextField)
- Textarea → TextField (multiline)

**Files to Update**:

- `src/app/video/[id]/edit/page.tsx` (video editing form)

---

## Component Mapping

### Input + Label → TextField

**shadcn Pattern**:

```tsx
<div>
  <Label htmlFor="title">Title</Label>
  <Input id="title" value={title} onChange={handleChange} />
</div>
```

**MUI Pattern**:

```tsx
<TextField label="Title" value={title} onChange={handleChange} fullWidth />
```

### Textarea → TextField (multiline)

**shadcn Pattern**:

```tsx
<Textarea value={description} onChange={handleChange} rows={4} />
```

**MUI Pattern**:

```tsx
<TextField
  label="Description"
  value={description}
  onChange={handleChange}
  multiline
  rows={4}
  fullWidth
/>
```

---

## Step 1: Update Video Edit Page

### File: `src/app/video/[id]/edit/page.tsx`

**Before** (shadcn):

```tsx
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

export default function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const videoQuery = api.video.get.useQuery({ id });
  const updateVideo = api.video.update.useMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">(
    "PUBLIC",
  );

  // ... rest of component logic

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Button variant="ghost" onClick={() => router.push("/library")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Library
      </Button>

      <Card className="mt-4 p-6">
        <h1 className="mb-6 text-2xl font-bold">Edit Video</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              maxLength={100}
              required
            />
            <p className="text-muted-foreground mt-1 text-sm">
              {title.length}/100
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={4}
              maxLength={5000}
            />
            <p className="text-muted-foreground mt-1 text-sm">
              {description.length}/5000
            </p>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              maxLength={500}
            />
            <p className="text-muted-foreground mt-1 text-sm">
              {tags.length}/500
            </p>
          </div>

          {/* Privacy select - will be updated in Phase 4 */}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/library")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

**After** (MUI):

```tsx
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { ArrowBack as ArrowLeft, Save } from "@mui/icons-material";

export default function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const videoQuery = api.video.get.useQuery({ id });
  const updateVideo = api.video.update.useMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">(
    "PUBLIC",
  );

  // ... rest of component logic

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4, px: 2 }}>
      <Button
        startIcon={<ArrowLeft />}
        onClick={() => router.push("/library")}
        sx={{ mb: 2 }}
      >
        Back to Library
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Video
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              required
              fullWidth
              inputProps={{ maxLength: 100 }}
              helperText={`${title.length}/100 characters`}
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              multiline
              rows={4}
              fullWidth
              inputProps={{ maxLength: 5000 }}
              helperText={`${description.length}/5000 characters`}
            />

            <TextField
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              fullWidth
              inputProps={{ maxLength: 500 }}
              helperText={`${tags.length}/500 characters`}
            />

            {/* Privacy select - will be updated in Phase 4 */}

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.push("/library")}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
```

### Key Changes Explained

1. **Import Changes**:
   - ❌ Removed: `@/components/ui/button`, `input`, `textarea`, `label`
   - ✅ Added: `@mui/material` components
   - ✅ Added: `@mui/icons-material` icons

2. **Layout Components**:
   - `<div className="container mx-auto">` → `<Box sx={{ maxWidth: 800, mx: 'auto' }}>`
   - `<Card className="mt-4 p-6">` → `<Paper sx={{ p: 3 }}>`
   - `<div className="space-y-4">` → `<Stack spacing={3}>`

3. **Input Components**:
   - `<Label>` + `<Input>` → Single `<TextField>` with `label` prop
   - `<Textarea>` → `<TextField multiline rows={4}>`
   - Character counters → `helperText` prop

4. **Button Components**:
   - `<Button variant="ghost">` → `<Button>` (default text variant)
   - Icons: `<Save className="mr-2" />` → `startIcon={<Save />}`

---

## TextField API Reference

### Common Props

```tsx
<TextField
  label="Field Label" // Label text
  value={value} // Controlled value
  onChange={handleChange} // Change handler
  placeholder="Placeholder" // Placeholder text
  required // Required field
  fullWidth // Take full container width
  error={hasError} // Error state
  helperText="Helper text" // Below-field text
  disabled // Disabled state
  multiline // Enable multiline (textarea)
  rows={4} // Number of rows (multiline)
  inputProps={{ maxLength: 100 }} // HTML input attributes
  type="text" // Input type (text, email, password, etc.)
/>
```

### Validation Example

```tsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!isEmailValid}
  helperText={!isEmailValid ? "Please enter a valid email" : ""}
  fullWidth
/>
```

---

## Testing Checklist

### ✅ Functional Testing

- [ ] Title field: Type, edit, see character counter
- [ ] Description field: Type multiple lines, see character counter
- [ ] Tags field: Type, edit, see character counter
- [ ] Character limits enforced (100, 5000, 500)
- [ ] Required validation works on title
- [ ] Save button submits form
- [ ] Cancel button navigates to library
- [ ] Back button navigates to library

### ✅ Visual Testing

- [ ] Fields aligned properly
- [ ] Labels positioned correctly above fields
- [ ] Helper text (character counters) visible below fields
- [ ] Error states display in red (if validation added)
- [ ] Focus states visible (blue outline)
- [ ] Fields take full width (`fullWidth` prop)
- [ ] Spacing consistent between fields

### ✅ Dark Mode Testing

- [ ] Light mode: Fields have white background
- [ ] Dark mode: Fields have appropriate dark background
- [ ] Labels readable in both modes
- [ ] Helper text readable in both modes
- [ ] Focus outline visible in both modes

### ✅ Responsive Testing

- [ ] Mobile (320px): Form stacks properly
- [ ] Tablet (768px): Form layout appropriate
- [ ] Desktop (1024px+): Max width constrains form

---

## Common Issues & Solutions

### Issue: Helper Text Not Visible

**Symptom**: Character counter doesn't show

**Solution**: Ensure `helperText` prop is set, not className

### Issue: Multiline Not Working

**Symptom**: Textarea appears as single line

**Solution**: Use both `multiline` and `rows` props together

### Issue: MaxLength Not Working

**Symptom**: Can type beyond character limit

**Solution**: Use `inputProps={{ maxLength: X }}` not `maxLength={X}`

### Issue: Label Overlaps Text

**Symptom**: Label sits on top of input value

**Solution**: TextField automatically handles this - ensure you're using MUI's TextField, not a custom component

---

## Accessibility Notes

### ✅ Built-in Accessibility

MUI TextField provides:

- Proper `<label>` association (via `id` and `htmlFor`)
- ARIA attributes (`aria-invalid`, `aria-describedby`)
- Focus management
- Screen reader announcements

### Additional Improvements

```tsx
<TextField
  label="Title"
  value={title}
  onChange={handleChange}
  aria-label="Video title" // Explicit ARIA label
  aria-required="true" // Screen reader announcement
  error={titleError}
  helperText={titleError || "Enter a descriptive title"}
/>
```

---

## Performance Considerations

### Optimization Tips

1. **Controlled Components**: Use `value` and `onChange` (already implemented)
2. **Debouncing**: For expensive operations (e.g., API calls on keystroke)
   ```tsx
   const debouncedSave = useMemo(
     () => debounce((value) => saveDraft(value), 500),
     [],
   );
   ```
3. **Memoization**: Wrap handler functions in `useCallback` if needed
4. **Avoid Inline Objects**: Move sx props to constants if complex

---

## Phase Completion Criteria

- [ ] All Input components replaced with TextField
- [ ] All Label components removed (labels in TextField)
- [ ] All Textarea components replaced with TextField multiline
- [ ] Character counters work via helperText
- [ ] Form submits successfully
- [ ] No TypeScript errors
- [ ] Visual appearance matches design intent
- [ ] Dark mode works correctly
- [ ] All tests pass

---

## Next Phase

Once Phase 2 is complete, proceed to:
📄 **[Phase 3: Button & Badge](./MUI_MIGRATION_PHASE_3_BUTTON_BADGE.md)**

---

**Phase 2 Status**: Core Inputs Complete ✅
