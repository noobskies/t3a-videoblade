# Phase 3: Expansion & Analytics

## Overview

Phase 3 focuses on transforming VideoBlade from a publishing tool into a comprehensive management platform. The key addition is the **Analytics Dashboard**, providing creators with actionable insights into their content's performance across platforms.

## Goals

1.  **Deep Analytics**: Aggregate views, likes, and engagement metrics.
2.  **Historical Trending**: Visualize performance growth over time.
3.  **Expanded Platform Support**: Add Vimeo and other platforms (TBD).
4.  **Production Hardening**: Ensure reliability at scale.

## Roadmap

### 1. Analytics Dashboard (Current Focus)

- **File**: `01-analytics.md`
- **Features**:
  - `MetricSnapshot` database model.
  - Daily background data fetching (Inngest).
  - Aggregated "Total Views" and "Total Engagement".
  - Historical trend charts using Recharts.
  - Platform-specific breakdowns.

### 2. Vimeo Integration (Planned)

- **File**: `02-vimeo-integration.md` (To be created)
- **Features**:
  - Vimeo OAuth.
  - Video upload to Vimeo.
  - Metadata management.

### 3. Batch Operations (Planned)

- **File**: `03-batch-ops.md` (To be created)
- **Features**:
  - Multi-file upload.
  - Bulk metadata editing.
  - Bulk publish.

## Success Criteria

- [ ] Database stores daily snapshots of video metrics.
- [ ] Users can view a unified dashboard of their total reach.
- [ ] Charts render correctly with historical data.
- [ ] Background jobs reliably fetch fresh data daily.
