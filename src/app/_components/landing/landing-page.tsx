import { Box } from "@mui/material";
import { Hero } from "./hero";
import { Features } from "./features";
import { Platforms } from "./platforms";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <Box component="main" sx={{ bgcolor: "background.default" }}>
      <Hero />
      <Platforms />
      <Features />
      <Footer />
    </Box>
  );
}
