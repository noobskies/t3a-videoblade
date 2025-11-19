"use client";

import { useState, useRef } from "react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = api.video.getUploadUrl.useMutation();
  const confirmUpload = api.video.confirmUpload.useMutation();

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
      setError(null);

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
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
          />
          <Typography variant="body1" gutterBottom>
            {file ? file.name : "Drag & drop or click to select video"}
          </Typography>
          {file && (
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
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
