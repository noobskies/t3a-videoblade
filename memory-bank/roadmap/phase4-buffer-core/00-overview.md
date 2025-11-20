# Phase 4: Core Buffer Experience

## Overview

This phase transforms VideoBlade into "MediaBlade" by implementing the core workflow features that define social media management tools like Buffer: **Visual Planning** and **Automated Queueing**.

## Goals

1.  **Multi-Format**: Support Images and Text posts, not just Video.
2.  **Visual Planning**: A calendar view to manage content strategy.
3.  **Set-and-Forget**: A queue system that automatically schedules posts into pre-defined slots.
4.  **Drafting**: A space for ideas before they become posts.

## Roadmap

### 1. Multi-Format Infrastructure

- **File**: `01-multi-format.md`
- **Features**:
  - Update `Post` schema to support `type` (VIDEO, IMAGE, TEXT).
  - Support multiple media attachments (Carousels).
  - Update Upload UI to handle images.

### 2. Visual Calendar

- **File**: `02-calendar-view.md`
- **Features**:
  - Interactive Monthly/Weekly view.
  - Drag-and-drop rescheduling.
  - Status indicators (Draft, Scheduled, Published).

### 3. Queue System

- **File**: `03-queue-system.md`
- **Features**:
  - Define "Posting Slots" per platform (e.g., Mon 9AM).
  - "Add to Queue" logic (find next empty slot).
  - Queue management UI.

### 4. Ideas & Drafts

- **File**: `04-ideas-drafts.md`
- **Features**:
  - Quick-entry text area.
  - Convert Idea -> Post workflow.

## Success Criteria

- [ ] User can upload an image and schedule it for X (Twitter).
- [ ] User can drag a post from Monday to Tuesday on the Calendar.
- [ ] "Add to Queue" automatically sets the correct time based on slots.
