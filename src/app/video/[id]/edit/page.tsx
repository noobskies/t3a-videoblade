"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  // Fetch video data
  const {
    data: video,
    isLoading,
    error,
  } = api.video.get.useQuery({ id: videoId });

  // Update mutation
  const updateVideo = api.video.update.useMutation({
    onSuccess: () => {
      router.push("/library");
    },
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">(
    "UNLISTED",
  );

  // Initialize form when video loads
  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description ?? "");
      setTags(video.tags ?? "");
      setPrivacy(video.privacy);
    }
  }, [video]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    updateVideo.mutate({
      id: videoId,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.trim() || undefined,
      privacy,
    });
  };

  const handleCancel = () => {
    router.push("/library");
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-white">Loading video...</div>
      </main>
    );
  }

  // Error state
  if (error) {
    throw new Error(error.message);
  }

  if (!video) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-white">Video not found</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Edit Video</h1>
            <p className="text-gray-400">{video.fileName}</p>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="max-w-2xl border-gray-700 bg-gray-800 p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter video title"
                className="border-gray-600 bg-gray-700"
              />
              <p className="text-xs text-gray-400">
                {title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Enter video description"
                className="border-gray-600 bg-gray-700"
              />
              <p className="text-xs text-gray-400">
                {description.length}/5,000 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                maxLength={500}
                placeholder="tech, tutorial, coding (comma-separated)"
                className="border-gray-600 bg-gray-700"
              />
              <p className="text-xs text-gray-400">
                {tags.length}/500 characters
              </p>
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select
                value={privacy}
                onValueChange={(value) =>
                  setPrivacy(value as "PUBLIC" | "UNLISTED" | "PRIVATE")
                }
              >
                <SelectTrigger className="border-gray-600 bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                {privacy === "PUBLIC" && "Anyone can find and view"}
                {privacy === "UNLISTED" && "Only people with the link can view"}
                {privacy === "PRIVATE" && "Only you can view"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateVideo.isPending || !title.trim()}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateVideo.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateVideo.isPending}
                className="border-gray-600 bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>

            {/* Error message */}
            {updateVideo.error && (
              <div className="rounded-md bg-red-900/20 p-3 text-sm text-red-400">
                Failed to update video: {updateVideo.error.message}
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
