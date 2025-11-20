import { VideoUpload } from "@/app/_components/video-upload";
import { Container, Stack } from "@mui/material";

export default function UploadPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        alignItems="center"
        spacing={4}
        sx={{ minHeight: "80vh", justifyContent: "center" }}
      >
        <VideoUpload />
      </Stack>
    </Container>
  );
}
