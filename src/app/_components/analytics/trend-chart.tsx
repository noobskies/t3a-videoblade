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

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const theme = useTheme();

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
            <Area
              type="monotone"
              dataKey="youtube"
              name="YouTube"
              stackId="1"
              stroke={theme.palette.error.main}
              fill={theme.palette.error.main}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="tiktok"
              name="TikTok"
              stackId="1"
              stroke={theme.palette.common.black} // TikTok is black/white, or we can use another color
              fill={theme.palette.common.black}
              fillOpacity={0.3}
            />
            {/* We can also just show 'views' as total if we don't stack */}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
