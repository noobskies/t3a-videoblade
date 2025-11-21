"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Container,
  Stack,
  Skeleton,
} from "@mui/material";
import { api } from "@/trpc/react";
import { use } from "react";

interface PlatformLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function PlatformLayout({
  children,
  params,
}: PlatformLayoutProps) {
  const { id } = use(params);
  const pathname = usePathname();

  // Determine current tab value based on pathname
  // /platforms/[id] -> 0
  // /platforms/[id]/inbox -> 1
  // /platforms/[id]/schedule -> 2
  // /platforms/[id]/settings -> 3
  let tabValue = 0;
  if (pathname.endsWith("/inbox")) tabValue = 1;
  else if (pathname.endsWith("/schedule")) tabValue = 2;
  else if (pathname.endsWith("/settings")) tabValue = 3;

  const { data: platforms } = api.platform.list.useQuery();
  const currentPlatform = platforms?.find((p) => p.id === id);

  if (!currentPlatform && !platforms) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" width={200} height={32} />
          <Skeleton variant="rectangular" width="100%" height={48} />
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Stack>
      </Container>
    );
  }

  if (platforms && !currentPlatform) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          Platform not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 3,
          pt: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {currentPlatform?.platformUsername ?? currentPlatform?.platform}
        </Typography>

        <Tabs value={tabValue} aria-label="platform tabs">
          <Tab label="Overview" component={Link} href={`/platforms/${id}`} />
          <Tab label="Inbox" component={Link} href={`/platforms/${id}/inbox`} />
          <Tab
            label="Schedule"
            component={Link}
            href={`/platforms/${id}/schedule`}
          />
          <Tab
            label="Settings"
            component={Link}
            href={`/platforms/${id}/settings`}
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 0 }}>{children}</Box>
    </Box>
  );
}
