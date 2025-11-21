"use client";

import { Container } from "@mui/material";
import { CommentList } from "@/app/_components/inbox/comment-list";

export function InboxClientPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CommentList />
    </Container>
  );
}
