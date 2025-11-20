"use client";

import React from "react";
import { Container, Grid, Typography, Stack, Box, Button } from "@mui/material";
import { api } from "@/trpc/react";
import { SummaryCards } from "@/app/_components/analytics/summary-cards";
import { TrendChart } from "@/app/_components/analytics/trend-chart";
import { PlatformBreakdown } from "@/app/_components/analytics/platform-breakdown";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function DashboardPage() {
  // Use Suspense Query for data fetching
  const [stats] = api.analytics.getDashboardStats.useSuspenseQuery();
  const [trends] = api.analytics.getTrends.useSuspenseQuery();

  const utils = api.useUtils();

  const handleRefresh = () => {
    void utils.analytics.getDashboardStats.invalidate();
    void utils.analytics.getTrends.invalidate();
  };

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Performance overview across all platforms
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Data
        </Button>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <SummaryCards stats={stats} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <TrendChart data={trends} />
        </Grid>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <PlatformBreakdown
            youtubeViews={stats.platformBreakdown.youtube}
            tiktokViews={stats.platformBreakdown.tiktok}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
