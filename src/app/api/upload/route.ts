import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Vercel has a read-only filesystem except /tmp
// For production, images should be stored externally (e.g., Cloudinary, S3)
// This API works for local development and non-serverless environments

const ALLOWED_TYPES = [
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/gif", "image/svg+xml",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Chỉ chấp nhận file ảnh (jpg, png, webp, gif). File của bạn: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File quá lớn (tối đa 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Try to write to public/uploads first (works on local / VPS)
    // Falls back to /tmp on serverless (Vercel)
    let savedUrl = "";
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      savedUrl = `/uploads/${filename}`;
    } catch (fsError) {
      // Serverless environment - try /tmp
      try {
        const tmpDir = path.join("/tmp", "uploads");
        await mkdir(tmpDir, { recursive: true });
        await writeFile(path.join(tmpDir, filename), buffer);
        savedUrl = `/tmp/uploads/${filename}`;
        console.warn("[UPLOAD] Wrote to /tmp (serverless). File will be lost on next cold start.");
      } catch (tmpError) {
        console.error("[UPLOAD] Both public/ and /tmp/ failed:", fsError, tmpError);
        return NextResponse.json(
          { error: "Không thể lưu file. Trên Vercel, hãy dùng link ảnh từ bên ngoài (Facebook, Imgur, Google Drive)." },
          { status: 500 }
        );
      }
    }

    console.log(`[UPLOAD] Saved: ${savedUrl}`);
    return NextResponse.json({ url: savedUrl });
  } catch (error: any) {
    console.error("[UPLOAD] Error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống khi tải ảnh" },
      { status: 500 }
    );
  }
}
