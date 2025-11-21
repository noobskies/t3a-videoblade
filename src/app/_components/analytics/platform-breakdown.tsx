"use client";

import React from "react";
import { Paper, Typography, Box, useTheme, Stack, Button } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { DashboardStats } from "@/lib/types/analytics";
import type { Platform } from "../../../../generated/prisma"; // Adjusted path based on file location
import Link from "next/link";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

interface ConnectedPlatform {
  platform: Platform;
}

interface PlatformBreakdownProps {
  platformBreakdown: DashboardStats["platformBreakdown"];
  connectedPlatforms: ConnectedPlatform[];
}

export function PlatformBreakdown({
  platformBreakdown,
  connectedPlatforms,
}: PlatformBreakdownProps) {
  const theme = useTheme();

  // Determine which platforms are connected
  const isYoutubeConnected = connectedPlatforms.some(
    (p) => p.platform === "YOUTUBE",
  );
  const isTiktokConnected = connectedPlatforms.some(
    (p) => p.platform === "TIKTOK",
  );
  const isVimeoConnected = connectedPlatforms.some(
    (p) => p.platform === "VIMEO",
  );
  const isLinkedinConnected = connectedPlatforms.some(
    (p) => p.platform === "LINKEDIN",
  );

  // Build chart data dynamically based on connection OR data presence
  // If data > 0, show it even if disconnected (historical).
  // If connected but 0, show it as 0 (Pie might ignore it, but legend will show).
  const rawData = [
    {
      name: "YouTube",
      value: platformBreakdown.youtube,
      platform: "YOUTUBE",
      color: "#FF0000", // YouTube Red
      show: isYoutubeConnected || platformBreakdown.youtube > 0,
    },
    {
      name: "TikTok",
      value: platformBreakdown.tiktok,
      platform: "TIKTOK",
      color: "#000000", // TikTok Black
      show: isTiktokConnected || platformBreakdown.tiktok > 0,
    },
    {
      name: "Vimeo",
      value: platformBreakdown.vimeo,
      platform: "VIMEO",
      color: "#1AB7EA", // Vimeo Blue
      show: isVimeoConnected || platformBreakdown.vimeo > 0,
    },
    {
      name: "LinkedIn",
      value: platformBreakdown.linkedin,
      platform: "LINKEDIN",
      color: "#0077B5", // LinkedIn Blue
      show: isLinkedinConnected || platformBreakdown.linkedin > 0,
    },
  ];

  const data = rawData.filter((d) => d.show);

  // Determine missing platforms for CTA
  const missingPlatforms = [];
  if (!isYoutubeConnected)
    missingPlatforms.push({
      name: "YouTube",
      icon: <YouTubeIcon fontSize="small" />,
    });
  if (!isTiktokConnected)
    missingPlatforms.push({
      name: "TikTok",
      icon: <MusicNoteIcon fontSize="small" />,
    });
  if (!isVimeoConnected)
    missingPlatforms.push({
      name: "Vimeo",
      icon: <OndemandVideoIcon fontSize="small" />,
    });
  if (!isLinkedinConnected)
    missingPlatforms.push({
      name: "LinkedIn",
      icon: <LinkedInIcon fontSize="small" />,
    });

  return (
    <Paper
      sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h6" gutterBottom>
        Views by Platform
      </Typography>

      <Box sx={{ flexGrow: 1, minHeight: 300, width: "100%" }}>
        {data.length > 0 && data.some((d) => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.disabled",
            }}
          >
            <Typography variant="body2">No view data available yet</Typography>
          </Box>
        )}
      </Box>

      {/* CTA for missing platforms */}
      {missingPlatforms.length > 0 && (
        <Box
          sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Connect more platforms:
          </Typography>
          <Stack spacing={1}>
            {missingPlatforms.map((p) => (
              <Button
                key={p.name}
                component={Link}
                href="/platforms"
                variant="text"
                color="primary"
                size="small"
                startIcon={p.icon}
                sx={{ justifyContent: "flex-start", px: 1 }}
              >
                Connect {p.name}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
