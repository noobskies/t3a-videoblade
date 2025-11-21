"use client";

import { Container, Grid, Paper, Typography, Box, Button } from "@mui/material";
import { use } from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlatformOverviewPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h4" gutterBottom>
            Channel Overview
          </Typography>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Typography color="text.secondary">
              Analytics summary coming soon...
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                component={Link}
                href={`/platforms/${id}/schedule`}
              >
                View Schedule
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href={`/platforms/${id}/inbox`}
              >
                Go to Inbox
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
