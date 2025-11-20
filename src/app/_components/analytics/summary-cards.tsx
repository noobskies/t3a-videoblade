"use client";

import React from "react";
import { Grid, Paper, Typography, Box, Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import type { DashboardStats } from "@/lib/types/analytics";

interface SummaryCardsProps {
  stats: DashboardStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: <VisibilityIcon color="primary" sx={{ fontSize: 32 }} />,
      change: `${stats.viewsGrowth}%`,
    },
    {
      title: "Total Likes",
      value: stats.totalLikes.toLocaleString(),
      icon: <ThumbUpIcon color="secondary" sx={{ fontSize: 32 }} />,
    },
    {
      title: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: <CommentIcon color="info" sx={{ fontSize: 32 }} />,
    },
    {
      title: "Published Videos",
      value: stats.totalVideos.toLocaleString(),
      icon: <VideoLibraryIcon color="warning" sx={{ fontSize: 32 }} />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderLeft: 4,
              borderColor: "divider", // Fallback or dynamic based on icon color
              // We can use sx props or style based on index
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {card.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                {card.icon}
              </Box>
            </Stack>
            {card.change && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ mt: 2, display: "block" }}
              >
                +{card.change} vs last 30 days
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
