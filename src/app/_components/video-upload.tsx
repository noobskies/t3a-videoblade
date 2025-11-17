"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const getUploadUrl = api.video.getUploadUrl.useMutation();
  const confirmUpload = api.video.confirmUpload.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const uploadToS3 = async (url: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    try {
      setIsUploading(true);
      setUploadStatus("uploading");
      setUploadProgress(0);

      // Step 1: Get presigned URL
      const { uploadUrl, s3Key, s3Bucket } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // Step 2: Upload to S3
      await uploadToS3(uploadUrl, file);

      // Step 3: Confirm upload and create video record
      await confirmUpload.mutateAsync({
        s3Key,
        s3Bucket,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        title,
        description: description || undefined,
        privacy: "UNLISTED",
      });

      setUploadStatus("success");
      setUploadProgress(100);

      // Reset form
      setTimeout(() => {
        setFile(null);
        setTitle("");
        setDescription("");
        setUploadProgress(0);
        setUploadStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
      <h2 className="mb-4 text-2xl font-bold">Upload Video</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
        />
        {file && (
          <p className="mt-1 text-sm text-gray-400">
            {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
          placeholder="My awesome video"
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          rows={4}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
          placeholder="Video description..."
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mb-4 rounded bg-green-900/50 p-3 text-green-200">
          ✅ Upload successful!
        </div>
      )}
      {uploadStatus === "error" && (
        <div className="mb-4 rounded bg-red-900/50 p-3 text-red-200">
          ❌ Upload failed. Please try again.
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || !title || isUploading}
        className="w-full rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload Video"}
      </button>
    </div>
  );
}
