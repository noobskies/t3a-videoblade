# Phase 1: Video Thumbnails

## Goal

Generate and display video thumbnails in the library for better visual recognition.

**Estimated Time**: 2-3 hours (Optional - can be Phase 2)

---

## Prerequisites

- [x] 02-s3-upload.md - Videos stored in S3
- [x] 03-video-library.md - Video library exists

---

## Approach

For MVP, we'll use simple solutions:

**Option 1**: First frame extraction (requires ffmpeg)
**Option 2**: Placeholder based on video type
**Option 3**: Use YouTube thumbnail after publish

We'll implement **Option 3** (simplest for MVP).

---

## Tasks

### Update After YouTube Publish

When video publishes to YouTube, fetch the thumbnail:

Update `src/inngest/publish-to-youtube.ts`:

```typescript
// After successful upload, get thumbnail
const thumbnailUrl = `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`;

// Update video with thumbnail
await db.video.update({
  where: { id: job.videoId },
  data: { thumbnailUrl },
});
```

### Fallback for Unpublished Videos

Videos without thumbnails show placeholder icon (already implemented in video-card.tsx).

---

## Future Enhancements

**Phase 2+**:

- Generate thumbnails from first frame using ffmpeg
- Allow custom thumbnail upload
- Generate thumbnails at multiple sizes

---

## Checklist

- [ ] Thumbnail URL stored after YouTube publish
- [ ] Thumbnails display in video library
- [ ] Placeholder shown for unpublished videos

**Estimated Completion**: ✅ 2-3 hours

---

## Next Step

👉 **[10-retry-logic.md](./10-retry-logic.md)** - Implement retry for failed publishes
