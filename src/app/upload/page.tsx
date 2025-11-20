import { BatchMediaUpload } from "@/app/_components/batch-media-upload";
import { Container, Stack } from "@mui/material";

export default function UploadPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        alignItems="center"
        spacing={4}
        sx={{ minHeight: "80vh", justifyContent: "center" }}
      >
        <BatchMediaUpload />
      </Stack>
    </Container>
  );
}
