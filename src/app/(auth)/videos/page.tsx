"use client";

import { useState } from "react";
import VideoUpload from "@/components/video/VideoUpload";
import VideoLibrary from "@/components/video/VideoLibrary";

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleUploadComplete = (video: any) => {
    // Switch to library tab after successful upload
    setActiveTab("library");
    setSelectedVideo(video);
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    // Could open a modal or navigate to video details
    console.log("Selected video:", video);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
              <p className="text-sm text-gray-600">Upload and manage your video content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("library")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "library"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📹 Video Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              ⬆️ Upload Video
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "library" && (
            <VideoLibrary onVideoSelect={handleVideoSelect} />
          )}
          {activeTab === "upload" && (
            <VideoUpload onUploadComplete={handleUploadComplete} />
          )}
        </div>
      </div>

      {/* Selected Video Info (could be expanded to a modal) */}
      {selectedVideo && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Selected Video</h4>
            <button
              onClick={() => setSelectedVideo(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 truncate">{selectedVideo.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            Status: <span className="capitalize">{selectedVideo.status}</span>
          </p>
        </div>
      )}
    </div>
  );
}
