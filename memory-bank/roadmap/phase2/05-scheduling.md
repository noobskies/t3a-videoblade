# Phase 2: Scheduled Publishing

## Goal

Allow users to schedule videos for future publishing with per-platform scheduling.

**Estimated Time**: 4-5 hours

---

## Prerequisites

- [x] Phase 1 - Inngest setup
- [x] 03-multi-platform-ui.md - Multi-platform publishing works
- [x] PublishJob has `scheduledFor` field

---

## What's Already In Schema

✅ `scheduledFor` field already exists in PublishJob model (from Phase 1)!

---

## Tasks

### 1. Add Date Picker Package

```bash
npm install react-day-picker date-fns
```

### 2. Update Multi-Platform Publish UI

Update `src/app/publish/[videoId]/page.tsx` to include scheduling:

```typescript
import { format } from "date-fns";

// Add state for scheduling
const [enableScheduling, setEnableScheduling] = useState(false);
const [schedules, setSchedules] = useState<Record<string, Date>>({});

// In platform-specific metadata section
<div>
  <label className="mb-2 flex items-center gap-2">
    <input
      type="checkbox"
      checked={!!schedules[platform]}
      onChange={(e) => {
        if (e.target.checked) {
          // Set default schedule to 1 hour from now
          const defaultTime = new Date(Date.now() + 3600000);
          setSchedules({ ...schedules, [platform]: defaultTime });
        } else {
          const newSchedules = { ...schedules };
          delete newSchedules[platform];
          setSchedules(newSchedules);
        }
      }}
      className="rounded"
    />
    <span className="text-sm">Schedule for later</span>
  </label>

  {schedules[platform] && (
    <div className="mt-2">
      <label className="mb-2 block text-sm">Publish Date & Time</label>
      <input
        type="datetime-local"
        value={format(schedules[platform], "yyyy-MM-dd'T'HH:mm")}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          setSchedules({ ...schedules, [platform]: newDate });
        }}
        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
        className="w-full rounded border border-gray-600 bg-gray-700 p-2"
      />
      <p className="mt-1 text-xs text-gray-400">
        {platform} will publish at: {format(schedules[platform], "PPpp")}
      </p>
    </div>
  )}
</div>
```

### 3. Update Publish Procedure

Update `publishMulti` to handle scheduling:

```typescript
publishMulti: protectedProcedure
  .input(
    z.object({
      videoId: z.string().cuid(),
      platforms: z.array(z.enum(["YOUTUBE", "TIKTOK"])),
      metadata: z.record(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"]).optional(),
        })
      ),
      schedules: z.record(z.date()).optional(), // Add this
    })
  )
  .mutation(async ({ ctx, input }) => {
    const jobIds: string[] = [];

    for (const platform of input.platforms) {
      const connection = await ctx.db.platformConnection.findUnique({
        where: {
          userId_platform: {
            userId: ctx.session.user.id,
            platform,
          },
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${platform} not connected`,
        });
      }

      // Get schedule for this platform
      const scheduledFor = input.schedules?.[platform];

      const job = await ctx.db.publishJob.create({
        data: {
          platform,
          status: "PENDING",
          videoId: input.videoId,
          platformConnectionId: connection.id,
          createdById: ctx.session.user.id,
          scheduledFor, // Add scheduled time
          ...input.metadata[platform],
        },
      });

      jobIds.push(job.id);

      // Only trigger immediately if not scheduled
      if (!scheduledFor || scheduledFor <= new Date()) {
        const eventName =
          platform === "TIKTOK"
            ? "video/publish.tiktok"
            : "video/publish.youtube";

        await inngest.send({
          name: eventName,
          data: { jobId: job.id },
        });
      }
    }

    return { jobIds };
  }),
```

### 4. Create Scheduled Job Checker

Create `src/inngest/check-scheduled-jobs.ts`:

```typescript
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";

export const checkScheduledJobsFunction = inngest.createFunction(
  {
    id: "check-scheduled-jobs",
    name: "Check Scheduled Publish Jobs",
  },
  { cron: "*/5 * * * *" }, // Every 5 minutes
  async ({ step }) => {
    // Find jobs scheduled for now or past
    const jobs = await step.run("find-scheduled-jobs", async () => {
      return await db.publishJob.findMany({
        where: {
          status: "PENDING",
          scheduledFor: {
            lte: new Date(),
          },
        },
      });
    });

    // Trigger each job
    await step.run("trigger-jobs", async () => {
      for (const job of jobs) {
        const eventName =
          job.platform === "TIKTOK"
            ? "video/publish.tiktok"
            : "video/publish.youtube";

        await inngest.send({
          name: eventName,
          data: { jobId: job.id },
        });
      }

      return { triggered: jobs.length };
    });

    return { jobsTriggered: jobs.length };
  },
);
```

### 5. Register Scheduled Job Checker

Update `src/app/api/inngest/route.ts`:

```typescript
import { checkScheduledJobsFunction } from "@/inngest/check-scheduled-jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishToYouTubeFunction,
    publishToTikTokFunction,
    checkScheduledJobsFunction, // Add this
  ],
});
```

### 6. Show Scheduled Jobs

Update video card to show scheduled status:

```typescript
{video.publishJobs
  .filter((j) => j.status === "PENDING" && j.scheduledFor)
  .map((job) => (
    <div key={job.id} className="mt-2 rounded bg-blue-900/30 p-2 text-sm">
      <p className="font-semibold text-blue-200">
        Scheduled: {job.platform}
      </p>
      <p className="text-xs text-blue-300">
        {format(new Date(job.scheduledFor), "PPpp")}
      </p>
    </div>
  ))}
```

### 7. Cancel Scheduled Job

Add procedure to cancel:

```typescript
/**
 * Cancel scheduled job
 */
cancelScheduledJob: protectedProcedure
  .input(z.object({ jobId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const job = await ctx.db.publishJob.findUnique({
      where: { id: input.jobId },
    });

    if (!job || job.createdById !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    if (job.status !== "PENDING") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Job is not pending",
      });
    }

    await ctx.db.publishJob.update({
      where: { id: input.jobId },
      data: { status: "CANCELLED" },
    });

    return { success: true };
  }),
```

---

## Features

✅ **Per-Platform Scheduling**:

- Each platform gets its own schedule time
- YouTube: 9am, TikTok: 10am

✅ **Schedule UI**:

- Checkbox to enable scheduling
- Date/time picker per platform
- Shows human-readable time

✅ **Automatic Processing**:

- Cron job checks every 5 minutes
- Triggers jobs when time comes
- Updates status automatically

✅ **Cancel Scheduled**:

- Users can cancel before publish
- Job status set to CANCELLED

---

## Testing

1. **Create video**
2. **Go to publish page**
3. **Select platforms**
4. **Enable scheduling** for each
5. **Set future time** (e.g., 2 minutes from now)
6. **Submit**
7. **Wait** for scheduled time
8. **Verify** jobs trigger automatically
9. **Check platforms** - videos published

---

## Common Issues

**Jobs Not Triggering**:

- Check cron function is registered
- Verify scheduledFor is in past
- Check Inngest dashboard for errors

**Wrong Time Zone**:

- Dates are stored in UTC
- Display in user's local time
- Use proper date formatting

**Scheduled Job Missed**:

- Cron runs every 5 minutes
- Jobs may trigger up to 5 min late
- Consider shorter interval if needed

---

## Checklist

- [ ] Date picker package installed
- [ ] Scheduling UI added to publish page
- [ ] Publish procedure handles schedules
- [ ] Scheduled job checker created
- [ ] Checker registered in Inngest
- [ ] Scheduled jobs display in library
- [ ] Cancel scheduled job works
- [ ] Test scheduled publish works

**Estimated Completion**: ✅ 4-5 hours

---

## 🎉 Phase 2 Complete!

With all 5 files complete, Phase 2 delivers:

✅ TikTok OAuth & API integration
✅ TikTok video publishing
✅ Multi-platform UI (YouTube + TikTok)
✅ Enhanced delete functionality
✅ Per-platform scheduling

**Total Phase 2 Time**: 15-19 hours

---

## Next Phase

👉 **Phase 3** - Additional platforms (Vimeo, Rumble), analytics, team features, API access

**Estimated Total Time Phase 1 + 2**: 43-61 hours (~5-8 weeks part-time)
