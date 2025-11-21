import {
  Card,
  CardContent,
  CardActions,
  Box,
  Stack,
  Skeleton,
  Container,
  Typography,
  Paper,
} from "@mui/material";

/**
 * Skeleton for a single Video Card (Grid Item)
 * Matches src/app/_components/video-card.tsx
 */
export function VideoCardSkeleton() {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail Area - 16:9 Aspect Ratio */}
      <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title */}
        <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />

        {/* Description - 2 lines */}
        <Skeleton variant="text" height={20} width="100%" />
        <Skeleton variant="text" height={20} width="60%" sx={{ mb: 2 }} />

        {/* Metadata Row (Size • Date • Privacy) */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="text" width={40} height={16} />
          <Skeleton variant="text" width={10} height={16} />
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={10} height={16} />
          <Skeleton variant="text" width={50} height={16} />
        </Stack>

        {/* Status Chips Row */}
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={100} height={24} />
          <Skeleton variant="rounded" width={100} height={24} />
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Skeleton
          variant="rectangular"
          height={36}
          sx={{ width: "100%", borderRadius: 1 }}
        />
        <Skeleton variant="circular" width={30} height={30} sx={{ ml: 1 }} />
        <Skeleton variant="circular" width={30} height={30} sx={{ ml: 0 }} />
      </CardActions>
    </Card>
  );
}

/**
 * Skeleton for a list of Video Cards (Grid)
 */
export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
      }}
      gap={3}
    >
      {Array.from(new Array(count)).map((_, index) => (
        <Box key={index}>
          <VideoCardSkeleton />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Skeleton for a Platform Connection Card
 * Matches src/app/platforms/page.tsx
 */
export function PlatformCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            {/* Platform Icon */}
            <Skeleton variant="circular" width={40} height={40} />

            {/* Title & Desc */}
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width={100} height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </Stack>

          {/* Action Button */}
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Stack>

        {/* Connected Info (Optional, showing it as if connected state) */}
        <Box
          mt={2}
          pt={2}
          borderTop={1}
          borderColor="divider"
          sx={{ opacity: 0.5 }}
        >
          <Skeleton variant="text" width={150} height={20} />
          <Skeleton variant="text" width={200} height={20} />
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for the Page Header (Title + Optional Action)
 */
export function PageHeaderSkeleton() {
  return (
    <Box sx={{ mb: 4, mt: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Skeleton variant="text" width={200} height={48} />
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Stack>
    </Box>
  );
}

/**
 * Generic Page Skeleton container
 */
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {children}
    </Container>
  );
}

/**
 * Skeleton for Landing Page Platforms Section
 * Matches src/app/_components/landing/platforms.tsx
 */
export function LandingPlatformsSkeleton() {
  return (
    <Box
      sx={{
        py: 8,
        borderTop: 1,
        borderColor: "divider",
        borderBottom: 1,
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" mb={4}>
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Stack
          direction="row"
          spacing={{ xs: 4, md: 8 }}
          justifyContent="center"
          flexWrap="wrap"
        >
          {[1, 2].map((i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={100} height={32} />
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * Skeleton for Landing Page Features Section
 * Matches src/app/_components/landing/features.tsx
 */
export function LandingFeaturesSkeleton() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Skeleton variant="text" width={400} height={56} />
            <Skeleton variant="text" width={600} height={32} />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
            gap={4}
          >
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} variant="outlined" sx={{ height: "100%", p: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Skeleton variant="circular" width={35} height={35} />
                    <Skeleton variant="text" width={150} height={32} />
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * Skeleton for Idea Card
 * Matches src/app/_components/ideas/idea-card.tsx
 */
export function IdeaCardSkeleton() {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton
          variant="text"
          width={80}
          height={16}
          sx={{ mt: 2, display: "block" }}
        />
      </CardContent>
      <CardActions>
        <Skeleton
          variant="rectangular"
          width={120}
          height={30}
          sx={{ mr: "auto", borderRadius: 1 }}
        />
        <Skeleton variant="circular" width={30} height={30} sx={{ ml: 1 }} />
        <Skeleton variant="circular" width={30} height={30} sx={{ ml: 0 }} />
      </CardActions>
    </Card>
  );
}

/**
 * Skeleton for a list of Idea Cards
 */
export function IdeaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
      }}
      gap={3}
    >
      {Array.from(new Array(count)).map((_, index) => (
        <Box key={index}>
          <IdeaCardSkeleton />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Skeleton for Edit Video Page
 * Matches src/app/video/[id]/edit/page.tsx
 */
export function EditPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={20} />
        </Box>
      </Stack>

      {/* Form */}
      <Paper elevation={1} sx={{ p: 4 }}>
        <Stack spacing={4}>
          {/* Thumbnail */}
          <Box
            sx={{
              width: "100%",
              position: "relative",
              paddingTop: "56.25%",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>

          {/* Inputs */}
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={160}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />

          {/* Actions */}
          <Stack direction="row" spacing={2} pt={2}>
            <Skeleton
              variant="rectangular"
              height={36}
              sx={{ flex: 1, borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={80}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

/**
 * Skeleton for Publish Page
 * Matches src/app/publish/[id]/page.tsx
 */
export function PublishPageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={350} height={24} />
      </Box>

      <Stack spacing={4}>
        {/* Video Summary Card */}
        <Card variant="outlined">
          <Stack direction="row" spacing={2} p={2} alignItems="center">
            <Skeleton
              variant="rectangular"
              width={120}
              height={68}
              sx={{ borderRadius: 1 }}
            />
            <Box>
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="text" width={100} height={20} />
            </Box>
          </Stack>
        </Card>

        {/* Platform Selection */}
        <Box>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ flex: 1, borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ flex: 1, borderRadius: 1 }}
            />
          </Stack>
        </Box>

        {/* Publish Button */}
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ width: "100%", borderRadius: 1 }}
        />
      </Stack>
    </Container>
  );
}
