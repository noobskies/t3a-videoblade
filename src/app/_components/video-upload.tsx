"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Box,
} from "@mui/material";
import { Upload as UploadIcon } from "lucide-react";

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
    <Card sx={{ width: "100%", maxWidth: 672 }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h5" component="h2">
            Upload Video
          </Typography>

          {/* File Input */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={isUploading}
              sx={{ py: 1.5 }}
            >
              {file ? "Change Video File" : "Select Video File"}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                hidden
              />
            </Button>
            {file && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
          </Box>

          {/* Title Input */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            placeholder="My awesome video"
            required
            fullWidth
          />

          {/* Description Input */}
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            placeholder="Video description..."
            multiline
            rows={4}
            fullWidth
          />

          {/* Upload Progress */}
          {isUploading && (
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Uploading...</Typography>
                <Typography variant="body2">{uploadProgress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <Alert severity="success">✅ Upload successful!</Alert>
          )}
          {uploadStatus === "error" && (
            <Alert severity="error">❌ Upload failed. Please try again.</Alert>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleUpload}
            disabled={!file || !title || isUploading}
            startIcon={<UploadIcon className="h-5 w-5" />}
            fullWidth
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
