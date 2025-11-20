"use client";

import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface PlatformBreakdownProps {
  // We don't have explicit breakdown in DashboardStats, but we can approximate or fetch separately.
  // For MVP, let's just use the total stats or assume we fetch breakdown data.
  // The trend data has daily breakdown, we can sum it up or the backend can return it.
  // Let's update DashboardStats to include breakdown or calculate it in parent component.
  // For now, I'll accept raw numbers.
  youtubeViews: number;
  tiktokViews: number;
}

export function PlatformBreakdown({
  youtubeViews,
  tiktokViews,
}: PlatformBreakdownProps) {
  const theme = useTheme();

  const data = [
    { name: "YouTube", value: youtubeViews },
    { name: "TikTok", value: tiktokViews },
  ];

  const COLORS = [theme.palette.error.main, theme.palette.common.black];

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Views by Platform
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
