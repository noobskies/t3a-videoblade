import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  CloudUpload,
  Schedule,
  Analytics,
  VideoLibrary,
} from "@mui/icons-material";

const features = [
  {
    icon: <CloudUpload fontSize="large" color="primary" />,
    title: "Upload Once",
    description:
      "Save hours by uploading your video just once. We handle the distribution to all your connected platforms.",
  },
  {
    icon: <Schedule fontSize="large" color="secondary" />,
    title: "Smart Scheduling",
    description:
      "Schedule your videos to go live at the perfect time on each platform independently.",
  },
  {
    icon: <Analytics fontSize="large" color="info" />,
    title: "Unified Analytics",
    description:
      "Track performance across all platforms from a single dashboard. (Coming Soon)",
  },
  {
    icon: <VideoLibrary fontSize="large" color="success" />,
    title: "Asset Management",
    description:
      "Keep your video library organized with tags, categories, and multi-platform metadata.",
  },
];

export function Features() {
  return (
    <Box
      id="features"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Box textAlign="center">
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Everything you need to scale
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Built for creators who want to reach more viewers with less
              effort.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card variant="outlined" sx={{ height: "100%", p: 2 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      {feature.icon}
                      <Typography variant="h5" fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
