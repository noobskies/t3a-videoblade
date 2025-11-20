import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { type PrismaClient } from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);

interface ScheduleSlot {
  day: number; // 0-6
  times: string[]; // "HH:MM"
}

export class QueueService {
  constructor(private db: PrismaClient) {}

  async getNextAvailableSlot(platformConnectionId: string): Promise<Date> {
    // 1. Fetch Schedule
    const schedule = await this.db.postingSchedule.findUnique({
      where: { platformConnectionId },
    });

    if (!schedule || !schedule.slots) {
      throw new Error("No posting schedule configured for this platform");
    }

    const timezone = schedule.timezone || "UTC";
    const slots = schedule.slots as unknown as ScheduleSlot[]; // Cast JSON

    if (slots.length === 0) {
      throw new Error("Posting schedule is empty");
    }

    // 2. Fetch Existing Jobs (Future only)
    const now = dayjs().tz(timezone);
    const existingJobs = await this.db.publishJob.findMany({
      where: {
        platformConnectionId,
        status: { in: ["SCHEDULED", "PLATFORM_SCHEDULED"] },
        scheduledFor: { gt: now.toDate() },
      },
      select: { scheduledFor: true },
      orderBy: { scheduledFor: "asc" },
    });

    const occupiedSlots = new Set(
      existingJobs
        .filter((j: { scheduledFor: Date | null }) => j.scheduledFor)
        .map((j: { scheduledFor: Date | null }) =>
          dayjs(j.scheduledFor!).tz(timezone).format("YYYY-MM-DD HH:mm"),
        ),
    );

    // 3. Find next slot
    // Look ahead 60 days max
    let currentDay = now;
    for (let i = 0; i < 60; i++) {
      const dayOfWeek = currentDay.day(); // 0-6
      const daySlots = slots.find((s) => s.day === dayOfWeek);

      if (daySlots && daySlots.times.length > 0) {
        // Sort times just in case
        const sortedTimes = [...daySlots.times].sort();

        for (const time of sortedTimes) {
          const [hStr, mStr] = time.split(":");
          const hour = Number(hStr);
          const minute = Number(mStr);

          if (isNaN(hour) || isNaN(minute)) continue;

          const potentialDate = currentDay
            .hour(hour)
            .minute(minute)
            .second(0)
            .millisecond(0);

          // If slot is in the past, skip
          if (potentialDate.isBefore(now)) continue;

          // Check collision
          const slotKey = potentialDate.format("YYYY-MM-DD HH:mm");
          if (!occupiedSlots.has(slotKey)) {
            return potentialDate.toDate();
          }
        }
      }

      // Move to next day
      currentDay = currentDay.add(1, "day").startOf("day");
    }

    throw new Error("No available slots found in the next 60 days");
  }
}
