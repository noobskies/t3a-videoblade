"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar,
  dayjsLocalizer,
  type Event,
  type View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
import { api } from "@/trpc/react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Setup the localizer by providing the moment (or localizer) object
// to the correct localizer.
const localizer = dayjsLocalizer(dayjs);

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: string;
    platform: string;
    thumbnailUrl: string | null;
  };
  color: string;
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Fetch events
  // We fetch a broad range to ensure we have data for current view
  // Optimization: Could rely on view/date state to fetch only needed range
  const {
    data: events = [],
    isLoading,
    refetch,
  } = api.calendar.getEvents.useQuery({
    start: dayjs(date).startOf("month").subtract(1, "month").toDate(),
    end: dayjs(date).endOf("month").add(1, "month").toDate(),
  });

  const rescheduleMutation = api.calendar.rescheduleEvent.useMutation();

  const onEventDrop = useCallback(
    async ({
      event,
      start,
    }: {
      event: CalendarEvent;
      start: Date | string;
    }) => {
      try {
        const newDate = new Date(start);

        // Optimistic update handled by refetch for now, but could update local state
        await rescheduleMutation.mutateAsync({
          jobId: event.id,
          newDate,
        });

        await refetch();
      } catch (error) {
        console.error("Failed to reschedule:", error);
        alert(error instanceof Error ? error.message : "Failed to reschedule");
      }
    },
    [rescheduleMutation, refetch],
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          overflow: "hidden",
        }}
      >
        {event.resource.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.resource.thumbnailUrl}
            alt=""
            style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              objectFit: "cover",
            }}
          />
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: "0.75rem" }}>
          {event.title}
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Content Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your scheduled content across all platforms.
        </Typography>
      </Box>

      {/* Legend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Typography variant="subtitle2">Legend:</Typography>
          <Chip
            label="Native Scheduled"
            size="small"
            sx={{ bgcolor: "#17a2b8", color: "white" }}
          />
          <Chip
            label="Internal Scheduled"
            size="small"
            sx={{ bgcolor: "#ffc107", color: "black" }}
          />
          <Chip
            label="Published"
            size="small"
            sx={{ bgcolor: "#28a745", color: "white" }}
          />
          <Chip
            label="Failed"
            size="small"
            sx={{ bgcolor: "#dc3545", color: "white" }}
          />
        </Stack>
      </Paper>

      {/* Error Handling */}
      {rescheduleMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rescheduleMutation.error.message}
        </Alert>
      )}

      <Paper sx={{ height: "calc(100vh - 250px)", p: 2, position: "relative" }}>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255, 255, 255, 0.5)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* @ts-expect-error - react-big-calendar types mismatch with dragAndDrop */}
        <DnDCalendar
          localizer={localizer}
          events={events as CalendarEvent[]}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          draggableAccessor={(event: CalendarEvent) =>
            event.resource.status !== "COMPLETED" &&
            event.resource.status !== "FAILED" &&
            event.resource.status !== "PROCESSING"
          }
          onEventDrop={onEventDrop}
          resizable={false}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
          popup
          style={{ height: "100%" }}
        />
      </Paper>
    </Container>
  );
}
