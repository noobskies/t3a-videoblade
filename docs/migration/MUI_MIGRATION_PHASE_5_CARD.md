# Phase 5: Card Composition 🃏

**Duration**: 3-4 hours | **Complexity**: High | **Prerequisites**: Phase 1, 3 Complete

---

## Overview

This is the most complex phase, migrating Card and all its sub-components from shadcn to Material-UI. The composition patterns differ significantly, requiring careful refactoring.

**Components to Migrate**:

- Card → MUI Card
- CardHeader → MUI CardHeader + Typography
- CardContent → MUI CardContent
- CardFooter → MUI CardActions
- CardTitle → Typography variant
- CardDescription → Typography variant
- CardAction → Custom positioning

**Files to Update** (2 primary):

- `src/app/_components/video-card.tsx` (primary usage - complex)
- `src/app/publish/[id]/page.tsx` (simpler usage)

---

## Component Mapping

### shadcn Card Structure

```tsx
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <IconButton />
    </CardAction>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>;
```

### MUI Card Structure

```tsx
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  IconButton,
} from "@mui/material";

<Card>
  <CardHeader title="Title" subheader="Description" action={<IconButton />} />
  <CardContent>Content here</CardContent>
  <CardActions>Footer actions</CardActions>
</Card>;
```

---

## Key Differences

| Aspect       | shadcn                     | MUI                            |
| ------------ | -------------------------- | ------------------------------ |
| **Title**    | `<CardTitle>` component    | `title` prop on CardHeader     |
| **Subtitle** | `<CardDescription>`        | `subheader` prop on CardHeader |
| **Action**   | `<CardAction>` component   | `action` prop on CardHeader    |
| **Footer**   | `<CardFooter>`             | `<CardActions>`                |
| **Spacing**  | Custom gap/padding classes | Built-in spacing               |
| **Media**    | Custom                     | `<CardMedia>` component        |

---

## Migration Strategy

### Pattern 1: Simple Card (Publish Page)

**Before** (shadcn):

```tsx
<Card className="mt-4 p-6">
  <CardHeader>
    <CardTitle>Platform Selection</CardTitle>
    <CardDescription>Choose where to publish</CardDescription>
  </CardHeader>
  <CardContent>{/* Platform options */}</CardContent>
</Card>
```

**After** (MUI):

```tsx
<Card sx={{ mt: 2 }}>
  <CardHeader title="Platform Selection" subheader="Choose where to publish" />
  <CardContent>{/* Platform options */}</CardContent>
</Card>
```

---

### Pattern 2: Complex Video Card

This is the most complex migration in the entire project.

#### File: `src/app/_components/video-card.tsx`

**Before** (shadcn - simplified):

```tsx
<Card className="hover:border-primary/50 overflow-hidden">
  <CardHeader className="p-0">
    <div className="bg-muted aspect-video">{/* Thumbnail */}</div>
  </CardHeader>

  <CardContent className="p-4">
    <h3 className="mb-1 truncate text-lg font-semibold">{video.title}</h3>
    <p className="text-muted-foreground">{video.description}</p>

    <div className="text-muted-foreground text-xs">{/* Metadata */}</div>

    {video.publishJobs.map((job) => (
      <Badge>{job.status}</Badge>
    ))}
  </CardContent>

  <CardFooter className="flex gap-2">
    <Button>Publish</Button>
    <Button size="icon">
      <Edit />
    </Button>
    <Button size="icon">
      <Trash2 />
    </Button>
  </CardFooter>
</Card>
```

**After** (MUI):

```tsx
<Card
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      borderColor: "primary.main",
      borderWidth: 2,
    },
  }}
>
  <CardMedia
    component="div"
    sx={{
      height: 200,
      bgcolor: "grey.200",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {video.thumbnailUrl ? (
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <VideoIcon sx={{ fontSize: 48, color: "grey.500" }} />
    )}
  </CardMedia>

  <CardContent sx={{ flexGrow: 1 }}>
    <Typography variant="h6" component="h3" noWrap gutterBottom>
      {video.title}
    </Typography>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}
    >
      {video.description}
    </Typography>

    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mt: 1, display: "block" }}
    >
      {formatFileSize(video.fileSize)} • {formatDate(video.createdAt)} •{" "}
      {video.privacy}
    </Typography>

    {video.publishJobs.length > 0 && (
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {video.publishJobs.map((job) => (
          <Chip
            key={job.platform}
            label={`${job.platform}: ${job.status}`}
            color={getStatusColor(job.status)}
            size="small"
          />
        ))}
      </Stack>
    )}
  </CardContent>

  <CardActions sx={{ p: 2, pt: 0 }}>
    <Button
      variant="contained"
      startIcon={<Upload />}
      onClick={() => router.push(`/publish/${video.id}`)}
      sx={{ flexGrow: 1 }}
    >
      Publish
    </Button>

    <IconButton onClick={() => router.push(`/video/${video.id}/edit`)}>
      <Edit />
    </IconButton>

    <IconButton color="error" onClick={handleDelete} disabled={isDeleting}>
      <Delete />
    </IconButton>
  </CardActions>
</Card>
```

---

## MUI Card API Reference

### Card Component

```tsx
<Card
  raised // Add elevation
  elevation={3} // Custom elevation (0-24)
  variant="outlined" // Border instead of shadow
  sx={
    {
      /* styles */
    }
  }
>
  {children}
</Card>
```

### CardHeader

```tsx
<CardHeader
  avatar={<Avatar>R</Avatar>} // Left side avatar
  title="Title" // Main title (string or element)
  subheader="Subheader" // Subtitle (string or element)
  action={<IconButton />} // Right side action
  titleTypographyProps={{ variant: "h6" }} // Customize title
  subheaderTypographyProps={{ variant: "body2" }} // Customize subheader
/>
```

### CardMedia

```tsx
<CardMedia
  component="img"
  height="140"
  image="/path/to/image.jpg"
  alt="Description"
/>

// Or custom content:
<CardMedia
  component="div"
  sx={{ height: 200, bgcolor: 'grey.300' }}
>
  <CustomContent />
</CardMedia>
```

### CardContent

```tsx
<CardContent>
  <Typography variant="body2">Content goes here</Typography>
</CardContent>
```

### CardActions

```tsx
<CardActions>
  <Button size="small">Action 1</Button>
  <Button size="small">Action 2</Button>
</CardActions>

// Right-aligned actions:
<CardActions sx={{ justifyContent: 'flex-end' }}>
  <Button>Cancel</Button>
  <Button variant="contained">Save</Button>
</CardActions>

// Space-between layout:
<CardActions sx={{ justifyContent: 'space-between' }}>
  <Button>Delete</Button>
  <Button variant="contained">Save</Button>
</CardActions>
```

---

## Advanced Patterns

### Card with Overflow Menu

```tsx
<Card>
  <CardHeader
    title="Video Title"
    subheader="Description"
    action={
      <IconButton>
        <MoreVert />
      </IconButton>
    }
  />
  <CardContent>Content</CardContent>
</Card>
```

### Card with Image and Content Overlay

```tsx
<Card sx={{ position: "relative" }}>
  <CardMedia component="img" height="200" image="/thumbnail.jpg" />
  <Box
    sx={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: "rgba(0, 0, 0, 0.6)",
      color: "white",
      p: 2,
    }}
  >
    <Typography variant="h6">Overlay Title</Typography>
  </Box>
</Card>
```

### Clickable Card

```tsx
<Card
  component="button"
  onClick={handleClick}
  sx={{
    cursor: "pointer",
    "&:hover": {
      boxShadow: 6,
    },
  }}
>
  <CardContent>Clickable content</CardContent>
</Card>
```

---

## Typography Integration

Since MUI Card uses Typography for titles and descriptions, here's the mapping:

### Title Variants

```tsx
// CardTitle equivalent:
<Typography variant="h6" component="h3">
  Main Title
</Typography>

// Smaller title:
<Typography variant="subtitle1" fontWeight="bold">
  Subtitle Title
</Typography>
```

### Description Variants

```tsx
// CardDescription equivalent:
<Typography variant="body2" color="text.secondary">
  Description text
</Typography>

// Caption (smaller):
<Typography variant="caption" color="text.secondary">
  Small description
</Typography>
```

### Text Truncation

```tsx
// Single line truncate:
<Typography noWrap>Long text that will truncate...</Typography>

// Multi-line clamp:
<Typography
  sx={{
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }}
>
  Long text that will show max 2 lines...
</Typography>
```

---

## Responsive Card Layouts

### Grid of Cards

```tsx
import { Grid } from "@mui/material";

<Grid container spacing={3}>
  {videos.map(video => (
    <Grid item key={video.id} xs={12} sm={6} md={4} lg=3}>
      <VideoCard video={video} />
    </Grid>
  ))}
</Grid>
```

### Masonry Layout (Advanced)

```tsx
import { Masonry } from "@mui/lab";

<Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
  {videos.map((video) => (
    <VideoCard key={video.id} video={video} />
  ))}
</Masonry>;
```

---

## Testing Checklist

### ✅ Functional Testing

- [ ] Cards render with all content
- [ ] Buttons in CardActions work
- [ ] CardHeader actions functional
- [ ] Image/media displays correctly
- [ ] Text truncation works
- [ ] Hover effects work
- [ ] Click handlers fire
- [ ] Navigation works from cards

### ✅ Visual Testing

- [ ] Card spacing consistent
- [ ] Elevation/shadows appropriate
- [ ] CardMedia aspect ratio correct
- [ ] Typography hierarchy clear
- [ ] Colors match design
- [ ] Borders/outlines visible
- [ ] CardActions aligned correctly

### ✅ Layout Testing

- [ ] Cards in grid align properly
- [ ] Cards have equal heights (if using flex)
- [ ] Responsive breakpoints work
- [ ] Content doesn't overflow
- [ ] CardActions stay at bottom

### ✅ Dark Mode Testing

- [ ] Card background correct in both modes
- [ ] Text readable in both modes
- [ ] Media placeholders appropriate
- [ ] Shadows visible in both modes

### ✅ Responsive Testing

- [ ] Mobile (320px): Single column layout
- [ ] Tablet (768px): 2-column layout
- [ ] Desktop (1024px+): 3-4 column layout
- [ ] Touch targets adequate on mobile

---

## Common Issues & Solutions

### Issue: Cards Different Heights in Grid

**Symptom**: Cards in same row have varying heights

**Solution**: Add `height: '100%'` and flexbox to Card:

```tsx
<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
  <CardContent sx={{ flexGrow: 1 }}>...</CardContent>
  <CardActions>...</CardActions>
</Card>
```

### Issue: CardMedia Not Showing

**Symptom**: Image area is empty or collapsed

**Solution**: Set explicit height or aspect ratio:

```tsx
<CardMedia
  component="img"
  height="200" // Or use sx={{ aspectRatio: '16/9' }}
  image={imageUrl}
/>
```

### Issue: CardActions Not at Bottom

**Symptom**: Actions float in middle of card

**Solution**: Use flexbox with `flexGrow: 1` on CardContent (see above)

### Issue: Image Not Covering CardMedia

**Symptom**: Image doesn't fill container

**Solution**: Use object-fit:

```tsx
<CardMedia component="img" sx={{ objectFit: "cover" }} image={imageUrl} />
```

---

## Accessibility Notes

### ✅ Card Semantics

```tsx
<Card component="article">
  {" "}
  {/* Semantic HTML */}
  <CardHeader title="Title" />
  <CardContent>
    <Typography>Content</Typography>
  </CardContent>
</Card>
```

### ✅ Interactive Cards

```tsx
<Card component="button" onClick={handleClick} aria-label="View video details">
  {/* Card content */}
</Card>
```

### ✅ Image Alt Text

```tsx
<CardMedia
  component="img"
  image={thumbnailUrl}
  alt={`Thumbnail for ${video.title}`} // Descriptive alt
/>
```

---

## Performance Considerations

### Optimization Tips

1. **Lazy Load Images**: Use Intersection Observer for thumbnails
2. **Virtualize Lists**: For 100+ cards, use react-window
3. **Memoize Cards**: Wrap VideoCard in `React.memo`
4. **Optimize Images**: Use appropriate sizes, WebP format

```tsx
const VideoCard = React.memo(({ video }) => {
  return <Card>{/* Card content */}</Card>;
});
```

---

## Phase Completion Criteria

- [ ] All Card components migrated to MUI
- [ ] CardHeader using title/subheader props
- [ ] CardFooter replaced with CardActions
- [ ] CardTitle/CardDescription replaced with Typography
- [ ] CardAction replaced with action prop
- [ ] CardMedia used for thumbnails
- [ ] No TypeScript errors
- [ ] All cards render correctly
- [ ] Grid layout works responsively
- [ ] Dark mode works correctly
- [ ] Images load and display properly

---

## Next Phase

Once Phase 5 is complete, proceed to:
📄 **[Phase 6: Layout & Polish](./MUI_MIGRATION_PHASE_6_POLISH.md)** (Final cleanup)

---

**Phase 5 Status**: Card Composition Complete ✅
