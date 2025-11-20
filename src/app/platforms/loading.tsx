import {
  PageSkeleton,
  PageHeaderSkeleton,
  PlatformCardSkeleton,
} from "@/app/_components/ui/skeletons";
import { Stack, Container } from "@mui/material";

export default function Loading() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeaderSkeleton />
      <Stack spacing={4}>
        <PlatformCardSkeleton />
        <PlatformCardSkeleton />
      </Stack>
    </Container>
  );
}
