import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { Hero } from "./hero";
import {
  LandingFeaturesSkeleton,
  LandingPlatformsSkeleton,
} from "../ui/skeletons";

// Lazy load below-the-fold components
const Platforms = dynamic(
  () => import("./platforms").then((mod) => mod.Platforms),
  {
    loading: () => <LandingPlatformsSkeleton />,
  },
);

const Features = dynamic(
  () => import("./features").then((mod) => mod.Features),
  {
    loading: () => <LandingFeaturesSkeleton />,
  },
);

const Footer = dynamic(() => import("./footer").then((mod) => mod.Footer));

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
