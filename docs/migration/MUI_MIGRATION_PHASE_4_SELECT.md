# Phase 4: Select Component 🔽

**Duration**: 1-2 hours | **Complexity**: Medium | **Prerequisites**: Phase 1, 2 Complete

---

## Overview

This phase migrates the Select component from shadcn to Material-UI. The shadcn Select is built on Radix UI and has a complex composition pattern. MUI's Select is simpler but requires a FormControl wrapper for proper styling.

**Component to Migrate**:

- Select (with SelectTrigger, SelectValue, SelectContent, SelectItem) → MUI Select + MenuItem

**File to Update**:

- `src/app/video/[id]/edit/page.tsx` (privacy dropdown only)

---

## Component Mapping

### shadcn Select Pattern

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select value={privacy} onValueChange={setPrivacy}>
  <SelectTrigger>
    <SelectValue placeholder="Select privacy" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="PUBLIC">Public</SelectItem>
    <SelectItem value="UNLISTED">Unlisted</SelectItem>
    <SelectItem value="PRIVATE">Private</SelectItem>
  </SelectContent>
</Select>;
```

### MUI Select Pattern

```tsx
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

<FormControl fullWidth>
  <InputLabel>Privacy</InputLabel>
  <Select
    value={privacy}
    onChange={(e) => setPrivacy(e.target.value)}
    label="Privacy"
  >
    <MenuItem value="PUBLIC">Public</MenuItem>
    <MenuItem value="UNLISTED">Unlisted</MenuItem>
    <MenuItem value="PRIVATE">Private</MenuItem>
  </Select>
</FormControl>;
```

---

## Key Differences

| Aspect             | shadcn                             | MUI                              |
| ------------------ | ---------------------------------- | -------------------------------- |
| **Wrapper**        | `<Select>` only                    | `<FormControl>` + `<InputLabel>` |
| **Trigger**        | `<SelectTrigger>`                  | Built into `<Select>`            |
| **Placeholder**    | `<SelectValue>`                    | `placeholder` prop (optional)    |
| **Items**          | `<SelectContent>` + `<SelectItem>` | `<MenuItem>` directly            |
| **Change Handler** | `onValueChange`                    | `onChange` with event            |
| **Label**          | Outside or none                    | `<InputLabel>` + `label` prop    |

---

## Step-by-Step Migration

### File: `src/app/video/[id]/edit/page.tsx`

**Before** (shadcn):

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ... in JSX

<div>
  <Label htmlFor="privacy">Privacy</Label>
  <Select value={privacy} onValueChange={setPrivacy}>
    <SelectTrigger id="privacy">
      <SelectValue placeholder="Select privacy level" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="PUBLIC">
        <div>
          <div className="font-medium">Public</div>
          <div className="text-muted-foreground text-sm">Anyone can watch</div>
        </div>
      </SelectItem>
      <SelectItem value="UNLISTED">
        <div>
          <div className="font-medium">Unlisted</div>
          <div className="text-muted-foreground text-sm">
            Anyone with the link
          </div>
        </div>
      </SelectItem>
      <SelectItem value="PRIVATE">
        <div>
          <div className="font-medium">Private</div>
          <div className="text-muted-foreground text-sm">
            Only you can watch
          </div>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>;
```

**After** (MUI):

```tsx
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

// ... in JSX

<FormControl fullWidth>
  <InputLabel id="privacy-label">Privacy</InputLabel>
  <Select
    labelId="privacy-label"
    id="privacy"
    value={privacy}
    onChange={(e) =>
      setPrivacy(e.target.value as "PUBLIC" | "UNLISTED" | "PRIVATE")
    }
    label="Privacy"
  >
    <MenuItem value="PUBLIC">Public - Anyone can watch</MenuItem>
    <MenuItem value="UNLISTED">Unlisted - Anyone with the link</MenuItem>
    <MenuItem value="PRIVATE">Private - Only you can watch</MenuItem>
  </Select>
  <FormHelperText>Choose who can view this video</FormHelperText>
</FormControl>;
```

**Simplified Version** (if descriptions not needed):

```tsx
<FormControl fullWidth>
  <InputLabel>Privacy</InputLabel>
  <Select
    value={privacy}
    onChange={(e) =>
      setPrivacy(e.target.value as "PUBLIC" | "UNLISTED" | "PRIVATE")
    }
    label="Privacy"
  >
    <MenuItem value="PUBLIC">Public</MenuItem>
    <MenuItem value="UNLISTED">Unlisted</MenuItem>
    <MenuItem value="PRIVATE">Private</MenuItem>
  </Select>
</FormControl>
```

---

## MUI Select API Reference

### Basic Structure

```tsx
<FormControl fullWidth>
  <InputLabel id="label-id">Label</InputLabel>
  <Select
    labelId="label-id"
    value={value}
    onChange={handleChange}
    label="Label"
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
```

### Common Props

**FormControl**:

- `fullWidth`: Take full container width
- `variant`: "outlined" (default), "filled", "standard"
- `error`: Show error state
- `disabled`: Disable the select

**InputLabel**:

- `id`: Required for labelId association
- `shrink`: Force label to shrink position

**Select**:

- `value`: Current selected value
- `onChange`: Change handler (receives event)
- `label`: Must match InputLabel text (for notch)
- `labelId`: Associates with InputLabel
- `multiple`: Allow multiple selection
- `displayEmpty`: Show label even when empty
- `renderValue`: Custom value rendering

**MenuItem**:

- `value`: Option value
- `disabled`: Disable this option
- `divider`: Add divider below

### With Helper Text

```tsx
<FormControl fullWidth error={hasError}>
  <InputLabel>Label</InputLabel>
  <Select value={value} onChange={handleChange} label="Label">
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
  </Select>
  <FormHelperText>
    {hasError ? "Please select an option" : "Helper text"}
  </FormHelperText>
</FormControl>
```

### Multiple Selection

```tsx
<FormControl fullWidth>
  <InputLabel>Tags</InputLabel>
  <Select
    multiple
    value={selectedTags}
    onChange={(e) => setSelectedTags(e.target.value)}
    label="Tags"
    renderValue={(selected) => selected.join(", ")}
  >
    <MenuItem value="tag1">Tag 1</MenuItem>
    <MenuItem value="tag2">Tag 2</MenuItem>
    <MenuItem value="tag3">Tag 3</MenuItem>
  </Select>
</FormControl>
```

---

## Advanced Patterns

### Select with Icons

```tsx
<Select>
  <MenuItem value="public">
    <ListItemIcon>
      <Public fontSize="small" />
    </ListItemIcon>
    <ListItemText primary="Public" secondary="Anyone can watch" />
  </MenuItem>
  <MenuItem value="unlisted">
    <ListItemIcon>
      <Link fontSize="small" />
    </ListItemIcon>
    <ListItemText primary="Unlisted" secondary="Anyone with the link" />
  </MenuItem>
</Select>
```

### Select with Descriptions (Tooltip Alternative)

Since MUI MenuItem doesn't support complex content easily, use simpler text or add tooltips:

```tsx
import { Tooltip } from "@mui/material";

<MenuItem value="PUBLIC">
  <Tooltip title="Anyone can search for and watch your video">
    <span>Public</span>
  </Tooltip>
</MenuItem>;
```

---

## Testing Checklist

### ✅ Functional Testing

- [ ] Select opens when clicked
- [ ] Options display correctly
- [ ] Selecting an option updates state
- [ ] Selected value displays in select
- [ ] Keyboard navigation works (Arrow keys, Enter, Escape)
- [ ] Form submission includes selected value
- [ ] Default value loads correctly

### ✅ Visual Testing

- [ ] Label positioned correctly (floating)
- [ ] Label shrinks when value selected
- [ ] Dropdown opens below select
- [ ] Selected option highlighted
- [ ] Hover states visible
- [ ] Focus outline visible
- [ ] Dropdown width matches select width

### ✅ Dark Mode Testing

- [ ] Select readable in both modes
- [ ] Dropdown background correct in both modes
- [ ] Selected option visible in both modes
- [ ] Label color appropriate in both modes

### ✅ Responsive Testing

- [ ] Select takes full width on mobile
- [ ] Dropdown doesn't overflow viewport
- [ ] Touch targets adequate (≥ 44px height)

---

## Common Issues & Solutions

### Issue: Label Overlaps Selected Value

**Symptom**: Label text sits on top of selected value

**Solution**: Ensure `label` prop on Select matches `InputLabel` text exactly

```tsx
// Both must match:
<InputLabel>Privacy</InputLabel>
<Select label="Privacy">  {/* MUST match */}
```

### Issue: Dropdown Not Opening

**Symptom**: Click does nothing

**Solution**: Ensure FormControl is not disabled, and Select has proper event handlers

### Issue: TypeScript Error on onChange

**Symptom**: Type error with `e.target.value`

**Solution**: Cast the value to the correct type:

```tsx
onChange={(e) => setPrivacy(e.target.value as "PUBLIC" | "UNLISTED" | "PRIVATE")}
```

### Issue: Select Value Not Updating

**Symptom**: Selecting option doesn't change displayed value

**Solution**: Verify `value` prop is connected to state and `onChange` updates state

---

## Accessibility Notes

### ✅ Built-in Accessibility

MUI Select provides:

- Proper ARIA roles (`role="combobox"`)
- ARIA attributes (`aria-labelledby`, `aria-expanded`)
- Keyboard navigation (Arrow keys, Enter, Escape, Home, End)
- Focus management

### ✅ Keyboard Shortcuts

- **Space/Enter**: Open dropdown
- **Arrow Down/Up**: Navigate options
- **Home/End**: Jump to first/last option
- **Escape**: Close dropdown
- **Type**: Search options by typing

### Additional Improvements

```tsx
<FormControl fullWidth>
  <InputLabel id="privacy-label">Privacy</InputLabel>
  <Select
    labelId="privacy-label"
    value={privacy}
    onChange={handleChange}
    label="Privacy"
    aria-describedby="privacy-helper"
  >
    <MenuItem value="PUBLIC">Public</MenuItem>
    <MenuItem value="UNLISTED">Unlisted</MenuItem>
    <MenuItem value="PRIVATE">Private</MenuItem>
  </Select>
  <FormHelperText id="privacy-helper">
    Choose who can view this video
  </FormHelperText>
</FormControl>
```

---

## Phase Completion Criteria

- [ ] shadcn Select removed from edit page
- [ ] MUI Select + MenuItem implemented
- [ ] FormControl + InputLabel wrapping Select
- [ ] Privacy options display correctly
- [ ] Selected value updates state
- [ ] Form submission includes correct value
- [ ] No TypeScript errors
- [ ] Dropdown works on all devices
- [ ] Keyboard navigation functional
- [ ] Dark mode works correctly

---

## Next Phase

Once Phase 4 is complete, proceed to:
📄 **[Phase 5: Card Composition](./MUI_MIGRATION_PHASE_5_CARD.md)** (Most complex phase)

---

**Phase 4 Status**: Select Complete ✅
