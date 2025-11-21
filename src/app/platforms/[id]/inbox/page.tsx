"use client";

import { Container } from "@mui/material";
import { CommentList } from "@/app/_components/inbox/comment-list";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlatformInboxPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CommentList platformConnectionId={id} />
    </Container>
  );
}
