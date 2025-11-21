"use client";

import { api } from "@/trpc/react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface PlatformQueuePageProps {
  platformConnectionId: string;
}

export function PlatformQueuePage({
  platformConnectionId,
}: PlatformQueuePageProps) {
  const { data: jobs, isLoading } = api.platform.getScheduledJobs.useQuery({
    connectionId: platformConnectionId,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography variant="h4">Content Queue</Typography>
        <Button
          variant="contained"
          startIcon={<CalendarTodayIcon />}
          component={Link}
          href="/calendar"
        >
          View Full Calendar
        </Button>
      </Stack>

      {(!jobs || jobs.length === 0) && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "background.default",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Queue is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Schedule posts to see them appear here.
          </Typography>
          <Button variant="contained" component={Link} href="/upload">
            Create New Post
          </Button>
        </Paper>
      )}

      <Stack spacing={2}>
        {jobs?.map((job) => (
          <Card key={job.id} sx={{ display: "flex", p: 1 }}>
            {job.post.thumbnailUrl ? (
              <CardMedia
                component="img"
                sx={{ width: 120, borderRadius: 1, objectFit: "cover" }}
                image={job.post.thumbnailUrl}
                alt={job.post.title ?? "Post thumbnail"}
              />
            ) : (
              <Box
                sx={{
                  width: 120,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  No Image
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <CardContent sx={{ flex: "1 0 auto", py: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Typography component="div" variant="h6" fontSize="1rem">
                    {job.post.title ?? "Untitled Post"}
                  </Typography>
                  <Chip
                    label={job.status}
                    size="small"
                    color={
                      job.status === "SCHEDULED"
                        ? "primary"
                        : job.status === "PROCESSING"
                          ? "warning"
                          : "default"
                    }
                  />
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mt={1}
                  color="text.secondary"
                >
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">
                    {job.scheduledFor
                      ? `Scheduled for ${dayjs(job.scheduledFor).format(
                          "MMM D, YYYY h:mm A",
                        )}`
                      : "Pending (Unscheduled)"}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  Type: {job.post.type}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
