import {
  PageSkeleton,
  PageHeaderSkeleton,
  VideoGridSkeleton,
} from "@/app/_components/ui/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton />
      <VideoGridSkeleton count={6} />
    </PageSkeleton>
  );
}
