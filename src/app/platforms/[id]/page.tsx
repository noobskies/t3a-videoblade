"use client";

import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  CardMedia,
} from "@mui/material";
import { use } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { SummaryCards } from "@/app/_components/analytics/summary-cards";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlatformOverviewPage({ params }: PageProps) {
  const { id } = use(params);

  const { data: stats, isLoading: statsLoading } =
    api.analytics.getPlatformStats.useQuery({
      connectionId: id,
    });

  const { data: jobs, isLoading: jobsLoading } =
    api.platform.getScheduledJobs.useQuery({
      connectionId: id,
    });

  const nextJob = jobs?.[0]; // First one is next due to ordering

  if (statsLoading || jobsLoading) {
    return (
      <Container
        maxWidth="xl"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Stats Section */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Performance
          </Typography>
          {stats ? (
            <SummaryCards stats={stats} />
          ) : (
            <Alert severity="info">No analytics data available yet.</Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Next Up */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Up Next
            </Typography>
            {nextJob ? (
              <Card sx={{ display: "flex", p: 1 }}>
                {nextJob.post.thumbnailUrl && (
                  <CardMedia
                    component="img"
                    sx={{ width: 140, borderRadius: 1, objectFit: "cover" }}
                    image={nextJob.post.thumbnailUrl}
                    alt={nextJob.post.title ?? "Thumbnail"}
                  />
                )}
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <CardContent sx={{ flex: "1 0 auto", py: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography component="div" variant="h6">
                        {nextJob.post.title ?? "Untitled Post"}
                      </Typography>
                      <Chip
                        label={nextJob.status}
                        color={
                          nextJob.status === "SCHEDULED" ? "primary" : "default"
                        }
                        size="small"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mt={2}
                      color="text.secondary"
                    >
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2">
                        {nextJob.scheduledFor
                          ? dayjs(nextJob.scheduledFor).format(
                              "MMMM D, YYYY [at] h:mm A",
                            )
                          : "Not scheduled yet"}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Box>
              </Card>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Queue is empty
                </Typography>
                <Button
                  variant="text"
                  startIcon={<CalendarTodayIcon />}
                  component={Link}
                  href={`/platforms/${id}/schedule`}
                >
                  Go to Schedule
                </Button>
              </Paper>
            )}
          </Grid>

          {/* Quick Actions / Recent Activity */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Activity
            </Typography>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Manage your channel content and interactions.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                    component={Link}
                    href={`/platforms/${id}/schedule`}
                    fullWidth
                  >
                    View Queue
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    component={Link}
                    href={`/platforms/${id}/inbox`}
                    fullWidth
                  >
                    Go to Inbox
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
