"use client";

import React from "react";
import { Container, Grid, Box, Stack, Skeleton, Paper } from "@mui/material";

export default function DashboardLoading() {
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      {/* Header Skeleton */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Skeleton variant="text" width={300} height={50} />
          <Skeleton variant="text" width={250} height={24} />
        </Box>
        <Skeleton variant="rectangular" width={150} height={40} />
      </Stack>

      {/* Summary Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box width="70%">
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={48} />
                </Box>
                <Skeleton variant="circular" width={40} height={40} />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3}>
        {/* Trend Chart */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Paper>
        </Grid>
        {/* Platform Breakdown */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={300}
            >
              <Skeleton variant="circular" width={200} height={200} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
