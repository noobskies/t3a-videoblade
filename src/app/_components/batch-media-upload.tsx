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
  IconButton,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface UploadQueueItem {
  id: string;
  file: File;
  title: string;
  description: string;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  previewUrl?: string;
  thumbnailBlob?: Blob | null;
}

export function BatchMediaUpload() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isGlobalUploading, setIsGlobalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = api.post.getUploadUrl.useMutation();
  const confirmUpload = api.post.confirmUpload.useMutation();

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const newItems: UploadQueueItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      status: "idle",
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so same files can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("video/") || f.type.startsWith("image/"),
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateItem = (id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  // Capture thumbnail helper (only for videos)
  const captureThumbnail = async (videoUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.currentTime = 1; // Capture at 1s

      video.onloadeddata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                resolve(blob);
                video.remove(); // Cleanup
              },
              "image/jpeg",
              0.7,
            );
          } else {
            resolve(null);
            video.remove();
          }
        } catch (e) {
          console.error("Thumbnail capture error", e);
          resolve(null);
          video.remove();
        }
      };

      video.onerror = () => {
        resolve(null);
        video.remove();
      };
    });
  };

  const uploadToS3 = async (
    url: string,
    file: Blob,
    contentType: string,
    onProgress?: (percent: number) => void,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
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

  const processUpload = async (item: UploadQueueItem) => {
    try {
      updateItem(item.id, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

      const isVideo = item.file.type.startsWith("video/");

      // 1. Capture Thumbnail (only for videos)
      let thumbnailBlob = item.thumbnailBlob;
      if (isVideo && !thumbnailBlob && item.previewUrl) {
        thumbnailBlob = await captureThumbnail(item.previewUrl);
      }
      // For images, we don't need a separate thumbnail upload (handled in confirmUpload logic if needed, or main file is thumb)

      // 2. Get Presigned URLs
      const { uploadUrl, s3Key, s3Bucket, thumbnailUploadUrl, thumbnailS3Key } =
        await getUploadUrl.mutateAsync({
          fileName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type,
          thumbnailType: thumbnailBlob ? "image/jpeg" : undefined,
        });

      // 3. Upload Main File
      await uploadToS3(uploadUrl, item.file, item.file.type, (percent) => {
        updateItem(item.id, { progress: percent });
      });

      // 4. Upload Thumbnail (if exists and needed)
      if (thumbnailBlob && thumbnailUploadUrl) {
        await uploadToS3(thumbnailUploadUrl, thumbnailBlob, "image/jpeg");
      }

      // 5. Confirm
      await confirmUpload.mutateAsync({
        s3Key,
        s3Bucket,
        fileName: item.file.name,
        fileSize: item.file.size,
        mimeType: item.file.type,
        title: item.title,
        description: item.description || undefined,
        privacy: "UNLISTED",
        thumbnailS3Key: thumbnailS3Key,
      });

      updateItem(item.id, { status: "success", progress: 100 });
    } catch (error) {
      console.error(`Upload failed for ${item.title}:`, error);
      updateItem(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  const handleUploadAll = async () => {
    setIsGlobalUploading(true);
    const pendingItems = queue.filter(
      (i) => i.status === "idle" || i.status === "error",
    );

    // Process sequentially for now
    for (const item of pendingItems) {
      await processUpload(item);
    }

    setIsGlobalUploading(false);
  };

  const handleClearCompleted = () => {
    setQueue((prev) => prev.filter((i) => i.status !== "success"));
  };

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Drop Zone */}
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: isGlobalUploading ? "action.disabled" : "primary.main",
          borderRadius: 2,
          p: 6,
          textAlign: "center",
          cursor: isGlobalUploading ? "not-allowed" : "pointer",
          bgcolor: "action.hover",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: isGlobalUploading ? "action.hover" : "action.selected",
          },
        }}
        onClick={() => !isGlobalUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          accept="video/*,image/*"
          onChange={handleFileChange}
          disabled={isGlobalUploading}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <CloudUploadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Files Here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports Videos and Images
        </Typography>
      </Paper>

      {/* Actions */}
      {queue.length > 0 && (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={handleClearCompleted}
            color="inherit"
            disabled={
              isGlobalUploading || !queue.some((i) => i.status === "success")
            }
          >
            Clear Completed
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadAll}
            disabled={
              isGlobalUploading ||
              !queue.some((i) => i.status === "idle" || i.status === "error")
            }
          >
            {isGlobalUploading ? "Uploading Queue..." : "Upload All"}
          </Button>
        </Stack>
      )}

      {/* Queue List */}
      <Stack spacing={2}>
        {queue.map((item) => {
          const isVideo = item.file.type.startsWith("video/");
          const isImage = item.file.type.startsWith("image/");

          return (
            <Card key={item.id} variant="outlined">
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Thumbnail Preview */}
                  <Grid size={{ xs: 4, sm: 3, md: 2 }}>
                    <Box
                      sx={{
                        width: "100%",
                        paddingTop: "56.25%",
                        position: "relative",
                        bgcolor: "black",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      {item.previewUrl ? (
                        isImage ? (
                          <img
                            src={item.previewUrl}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            alt="Preview"
                          />
                        ) : (
                          <video
                            src={item.previewUrl}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isVideo ? (
                            <PlayArrowIcon sx={{ color: "white" }} />
                          ) : (
                            <InsertPhotoIcon sx={{ color: "white" }} />
                          )}
                        </Box>
                      )}
                      {item.status === "success" && (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircleIcon color="success" fontSize="large" />
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Inputs */}
                  <Grid size={{ xs: 8, sm: 9, md: 10 }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <TextField
                          label="Title"
                          value={item.title}
                          onChange={(e) =>
                            updateItem(item.id, { title: e.target.value })
                          }
                          disabled={
                            item.status !== "idle" && item.status !== "error"
                          }
                          size="small"
                          fullWidth
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeItem(item.id)}
                          disabled={
                            item.status === "uploading" ||
                            item.status === "success"
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <TextField
                        label="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, { description: e.target.value })
                        }
                        disabled={
                          item.status !== "idle" && item.status !== "error"
                        }
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                      />

                      {/* Progress / Status */}
                      <Box>
                        {item.status === "uploading" && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={item.progress}
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.progress}%
                            </Typography>
                          </Box>
                        )}
                        {item.status === "error" && (
                          <Alert
                            severity="error"
                            icon={<ErrorIcon fontSize="inherit" />}
                          >
                            {item.error ?? "Upload failed"}
                          </Alert>
                        )}
                        {item.status === "success" && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            fontWeight="bold"
                          >
                            Upload Complete
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
