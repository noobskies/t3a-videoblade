# Phase 3, Step 1: Analytics Dashboard

## 1. Database Schema Update

We need to store historical data to render trend charts. We will introduce a `MetricSnapshot` model that links to a `PublishJob`.

```prisma
// prisma/schema.prisma

model MetricSnapshot {
    id            String   @id @default(cuid())
    createdAt     DateTime @default(now())

    // The specific publication this snapshot tracks
    publishJob    PublishJob @relation(fields: [publishJobId], references: [id], onDelete: Cascade)
    publishJobId  String

    // Metrics (Snapshot at this point in time)
    views         Int      @default(0)
    likes         Int      @default(0)
    comments      Int      @default(0)
    shares        Int      @default(0)

    @@index([publishJobId])
    @@index([createdAt])
}
```

## 2. Data Collection (Inngest)

We will create a new Inngest function `snapshot-analytics` that runs daily.

**Logic**:

1.  **Trigger**: Cron job (e.g., `0 0 * * *` - daily at midnight).
2.  **Process**:
    - Fetch all `PlatformConnection`s.
    - For each connection, fetch all associated `PublishJob`s where `status` is `COMPLETED` and `platformVideoId` exists.
    - **Batching**: Group video IDs by platform to respect rate limits.
    - **Fetch**: Call platform APIs (YouTube Data API, TikTok API) to get current stats.
    - **Store**: Create a new `MetricSnapshot` for each video.

**API Requirements**:

- **YouTube**: `videos.list` with `part=statistics`.
- **TikTok**: `video/query` (or similar endpoint depending on API version available).

## 3. Backend API (tRPC)

Create `src/server/api/routers/analytics.ts`.

**Procedures**:

- `getDashboardStats`: Returns aggregated totals (current views, likes, etc.) and % change vs 30 days ago.
- `getTrends`: Returns daily aggregated data for charts (e.g., `{ date: '2025-11-01', views: 10500, youtube: 8000, tiktok: 2500 }`).
- `getVideoStats`: Returns history for a specific video.

## 4. Frontend Implementation

**Dependencies**:

- `recharts`: For rendering charts.
- `lucide-react`: (Re-add specific icons if needed, or use MUI icons). _Note: We migrated to MUI Icons, so use those._

**Components**:

- `src/app/_components/analytics/summary-cards.tsx`: Displays the big numbers.
- `src/app/_components/analytics/trend-chart.tsx`: The main line chart.
- `src/app/_components/analytics/platform-breakdown.tsx`: Pie chart.
- `src/app/dashboard/page.tsx`: New dashboard page (or update existing home).

**Page Layout**:

- **Header**: "Analytics Dashboard" + Date Range Picker (future).
- **Row 1**: Summary Cards (Views, Engagement, Videos).
- **Row 2**: Main Trend Chart (Views over time).
- **Row 3**: Platform Breakdown (Pie) + Top Videos (Table).

## 5. Implementation Steps

1.  [ ] Update `prisma/schema.prisma` and run migration.
2.  [ ] Create `src/inngest/snapshot-analytics.ts` function.
3.  [ ] Implement `getStats` in `src/lib/youtube.ts` and `src/lib/tiktok.ts`.
4.  [ ] Create `analytics` router in tRPC.
5.  [ ] Install `recharts`.
6.  [ ] Build UI components.
7.  [ ] Verify data flow and chart rendering.
