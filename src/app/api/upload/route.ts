import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/server/auth";

// Maximum file size: 10GB (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

// Supported video formats
const SUPPORTED_FORMATS = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/mkv",
  "video/x-matroska",
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file format",
          supportedFormats: SUPPORTED_FORMATS,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() ?? "mp4";
    const fileName = `videos/${session.user.id}/${timestamp}-${randomString}.${fileExtension}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(fileName, file, {
        access: "public",
      });

      // Return upload success response
      return NextResponse.json({
        success: true,
        file: {
          url: blob.url,
          fileName: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle upload progress (for chunked uploads)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This would handle resumable uploads if needed
    // For now, return not implemented
    return NextResponse.json(
      { error: "Resumable uploads not yet implemented" },
      { status: 501 },
    );
  } catch (error) {
    console.error("Upload PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
