import { Box, Container, Stack, Typography, Link } from "@mui/material";

export function Footer() {
  return (
    <Box sx={{ py: 4, borderTop: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} VideoBlade. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={3}>
            {/* Placeholder links */}
            <Link href="#" color="text.secondary" underline="hover">
              Privacy
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Terms
            </Link>
            <Link
              href="https://github.com/noobskies/t3a-videoblade"
              color="text.secondary"
              underline="hover"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
