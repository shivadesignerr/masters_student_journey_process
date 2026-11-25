import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Sanitize filename: keep alphanumerics, dots, hyphens, underscores
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const userId = session.id.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${userId}_${timestamp}_${originalName}`;

    // Ensure upload directory exists under public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Write the file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL path so it can be served statically
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    });
  } catch (error) {
    console.error("[File Upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

// Next.js App Router does not need an API config export — remove it
export const maxDuration = 30;
