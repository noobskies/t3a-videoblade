import { type Metadata } from "next";
import { InboxClientPage } from "./client-page";

export const metadata: Metadata = {
  title: "Inbox | MediaBlade",
  description: "Unified inbox for all your social media comments",
};

export default function InboxPage() {
  return <InboxClientPage />;
}
