"use client";

import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrendDataPoint } from "@/lib/types/analytics";
import type { PlatformConnection } from "@/lib/types/platform";

interface TrendChartProps {
  data: TrendDataPoint[];
  connectedPlatforms: PlatformConnection[];
}

export function TrendChart({ data, connectedPlatforms }: TrendChartProps) {
  const theme = useTheme();

  const hasYouTube = connectedPlatforms.some((p) => p.platform === "YOUTUBE");
  const hasTikTok = connectedPlatforms.some((p) => p.platform === "TIKTOK");
  const hasVimeo = connectedPlatforms.some((p) => p.platform === "VIMEO");
  const hasLinkedin = connectedPlatforms.some((p) => p.platform === "LINKEDIN");

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Views Growth (Last 30 Days)
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tickFormatter={(str: string) => {
                const date = new Date(str);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Legend />
            {hasYouTube && (
              <Area
                type="monotone"
                dataKey="youtube"
                name="YouTube"
                stackId="1"
                stroke={theme.palette.error.main}
                fill={theme.palette.error.main}
                fillOpacity={0.3}
              />
            )}
            {hasTikTok && (
              <Area
                type="monotone"
                dataKey="tiktok"
                name="TikTok"
                stackId="1"
                stroke={theme.palette.text.primary}
                fill={theme.palette.text.primary}
                fillOpacity={0.3}
              />
            )}
            {hasVimeo && (
              <Area
                type="monotone"
                dataKey="vimeo"
                name="Vimeo"
                stackId="1"
                stroke="#1AB7EA"
                fill="#1AB7EA"
                fillOpacity={0.3}
              />
            )}
            {hasLinkedin && (
              <Area
                type="monotone"
                dataKey="linkedin"
                name="LinkedIn"
                stackId="1"
                stroke="#0077B5"
                fill="#0077B5"
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
