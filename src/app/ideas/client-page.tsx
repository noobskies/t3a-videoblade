"use client";

import { api } from "@/trpc/react";
import { Box, Container, Typography, Stack, Alert, Grid } from "@mui/material";
import { QuickEntry } from "@/app/_components/ideas/quick-entry";
import { IdeaCard } from "@/app/_components/ideas/idea-card";
import { Lightbulb as IdeaIcon } from "@mui/icons-material";

export default function IdeasPage() {
  const {
    data: ideas,
    refetch,
    isLoading,
    error,
  } = api.post.list.useQuery({
    isIdea: true,
  });

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load ideas: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <IdeaIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Ideas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Capture your thoughts and drafts before they become posts.
            </Typography>
          </Box>
        </Stack>

        <QuickEntry onSuccess={refetch} />

        {isLoading ? (
          <Typography>Loading ideas...</Typography>
        ) : ideas && ideas.length > 0 ? (
          <Grid container spacing={3}>
            {ideas.map((idea) => (
              <Grid key={idea.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <IdeaCard idea={idea} onDelete={refetch} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <IdeaIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">No ideas yet</Typography>
            <Typography variant="body2">
              Use the quick entry above to capture your first idea!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
