import { VideoUpload } from "@/app/_components/video-upload";
import { Container, Typography, Stack } from "@mui/material";

export default function UploadPage() {
  return (
    <Container maxWidth="md" component="main" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" component="h1">
          Upload Video
        </Typography>
        <VideoUpload />
      </Stack>
    </Container>
  );
}
