# Phase 6: Engagement (Unified Inbox)

## Overview

The "Engagement" phase transforms MediaBlade from a one-way publishing tool into a two-way communication platform. The core feature is the **Unified Inbox**, which aggregates comments, mentions, and messages from all connected platforms into a single interface.

## Goals

1.  **Aggregation**: Fetch comments/replies from YouTube, LinkedIn, TikTok, and Vimeo.
2.  **Actionability**: Reply to, like, or delete comments directly from MediaBlade.
3.  **Efficiency**: "Zero Inbox" workflow—mark conversations as "Done".

## Roadmap

### 1. Unified Inbox Foundation

- **File**: `01-unified-inbox.md`
- **Features**:
  - Database schema for syncing comments (optional, caching vs. real-time).
  - "Inbox" UI layout.
  - Connection to platform APIs for fetching comments.

### 2. Reply Functionality

- **File**: `02-reply-system.md`
- **Features**:
  - Posting replies via API.
  - Optimistic UI updates.
  - Handling platform-specific constraints (e.g., max length).

## Success Criteria

- [ ] User can see a list of recent comments from at least 2 platforms (e.g., YouTube, LinkedIn).
- [ ] User can reply to a comment from the dashboard.
- [ ] User can mark a conversation as "Resolved/Done".
