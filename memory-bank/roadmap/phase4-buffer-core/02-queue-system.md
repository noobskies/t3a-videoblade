# Phase 4, Step 3: Queue System

## Overview

The "Queue" is the heart of the Buffer-like experience. It allows users to define "Posting Slots" (e.g., "Every Monday at 9 AM") and then simply "Add to Queue" without having to manually select a date and time for every post. The system automatically finds the next available slot.

## 1. Database Schema

We need a way to store the posting schedule for each platform connection.

```prisma
model PostingSchedule {
    id        String   @id @default(cuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    // Configuration
    timezone String // e.g., "America/Chicago"

    // Schedule Definition
    // Stored as JSON for flexibility, or structured fields?
    // Structured is better for querying if we need to, but JSON is easier for complex recurring patterns.
    // Let's go with a simple structured approach first: Days of week + Times.

    // We will allow multiple "slots" to be defined.
    // A slot is "Day of Week" + "Time".
    // To keep it simple, we can store an array of times for each day, or a flat list of slots.

    // Option A: JSON
    // slots = [{ day: 1, time: "09:00" }, { day: 3, time: "12:00" }]

    // Option B: Relation
    // Schedule -> ScheduleSlots[]

    // Let's go with Option A (JSON) for simplicity in MVP. It's just configuration data.
    slots Json // Array of { day: number (0-6), times: string[] ("HH:MM") }

    // Relationship
    platformConnection   PlatformConnection @relation(fields: [platformConnectionId], references: [id], onDelete: Cascade)
    platformConnectionId String @unique // One schedule per connection

    @@index([platformConnectionId])
}
```

_Correction_: The plan mentioned `days` and `times` arrays. A JSON `slots` structure is probably more flexible (e.g. "Mon 9am", "Wed 5pm" - different times on different days).
Structure: `[{ day: 1, times: ["09:00", "12:00"] }, { day: 2, times: ["10:00"] }]`

## 2. Backend Logic

### `scheduleRouter`

- `getSettings(platformConnectionId)`: Fetch schedule.
- `updateSettings(platformConnectionId, data)`: Update timezone and slots.

### Queue Algorithm (`QueueService`)

- `getNextAvailableSlot(platformConnectionId)`:
  1. Load Schedule.
  2. Get `now`.
  3. Generate a list of _potential_ slot timestamps for the next X weeks (e.g., 2 weeks).
  4. Query DB for existing `PublishJob`s for this connection in that range.
  5. Filter out potential slots that collide (or are too close) to existing jobs.
  6. Return the first available timestamp.

## 3. Frontend UI

### Schedule Settings Page (`/platforms/[id]/schedule`)

- A UI to manage the schedule.
- Select Timezone.
- "Weekly Schedule" visualizer.
- "Add Posting Time":
  - Checkboxes for Days (Mon, Tue, Wed...)
  - Time picker.
  - "Add" button.

### "Add to Queue" Action

- In `BatchMediaUpload` (and Edit Post):
  - New button "Add to Queue".
  - Calls a mutation that uses the Queue Algorithm to set `scheduledAt`.

## 4. Implementation Steps

1.  **Schema**: Add `PostingSchedule` model.
2.  **Router**: Create `schedule.ts` router.
3.  **Service**: Implement `getNextAvailableSlot` logic.
4.  **UI**: Build Schedule Settings component.
5.  **Integration**: Connect "Add to Queue" button.
