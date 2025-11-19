"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getUploadUrl = api.video.getUploadUrl.useMutation();
  const confirmUpload = api.video.confirmUpload.useMutation();

  // Create preview URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type.startsWith("video/")) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const uploadToS3 = async (url: string, file: Blob, contentType: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (file instanceof File) {
        // Only track progress for the main video file
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
      }

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
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(file);
    });
  };

  const captureThumbnail = async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.7,
        );
      });
    } catch (err) {
      console.error("Failed to capture thumbnail", err);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    try {
      setIsUploading(true);
      setUploadStatus("uploading");
      setUploadProgress(0);
      setError(null);

      // Generate thumbnail if possible
      const thumbnailBlob = await captureThumbnail();

      // Step 1: Get presigned URLs
      const { uploadUrl, s3Key, s3Bucket, thumbnailUploadUrl, thumbnailS3Key } =
        await getUploadUrl.mutateAsync({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          thumbnailType: thumbnailBlob ? "image/jpeg" : undefined,
        });

      // Step 2: Upload video to S3
      await uploadToS3(uploadUrl, file, file.type);

      // Step 2b: Upload thumbnail if present
      if (thumbnailBlob && thumbnailUploadUrl) {
        await uploadToS3(thumbnailUploadUrl, thumbnailBlob, "image/jpeg");
      }

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
        thumbnailS3Key: thumbnailS3Key,
      });

      setUploadStatus("success");
      setUploadProgress(100);

      // Reset form after delay
      setTimeout(() => {
        setFile(null);
        setTitle("");
        setDescription("");
        setUploadProgress(0);
        setUploadStatus("idle");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth: "sm",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Upload Video
        </Typography>

        {/* File Upload Area */}
        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: isUploading ? "action.disabled" : "primary.main",
            borderRadius: 1,
            p: 4,
            textAlign: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            bgcolor: "action.hover",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: isUploading ? "action.hover" : "action.selected",
            },
          }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          {previewUrl ? (
            <Box
              sx={{
                width: "100%",
                position: "relative",
                paddingTop: "56.25%", // 16:9
                bgcolor: "black",
                borderRadius: 1,
                overflow: "hidden",
                mb: 2,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent clicking container to re-open file dialog
            >
              <video
                ref={videoRef}
                src={previewUrl}
                controls
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          ) : (
            <CloudUploadIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
            />
          )}

          <Typography variant="body1" gutterBottom>
            {file ? file.name : "Drag & drop or click to select video"}
          </Typography>
          {file && (
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}
          {previewUrl && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              sx={{ mt: 1 }}
            >
              Change Video
            </Button>
          )}
        </Box>

        {/* Form Fields */}
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          fullWidth
          required
          placeholder="My awesome video"
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          fullWidth
          multiline
          rows={4}
          placeholder="Video description..."
        />

        {/* Progress */}
        {isUploading && (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <Alert severity="success">Upload successful!</Alert>
        )}
        {uploadStatus === "error" && (
          <Alert severity="error">
            {error ?? "Upload failed. Please try again."}
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || !title || isUploading}
          fullWidth
          size="large"
          startIcon={!isUploading && <CloudUploadIcon />}
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </Button>
      </Stack>
    </Paper>
  );
}
