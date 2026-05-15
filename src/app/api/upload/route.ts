import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/gif", "image/svg+xml",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload ảnh:
 * - Nếu có IMGBB_API_KEY → upload lên imgbb (miễn phí, vĩnh viễn)
 * - Nếu không → lưu local vào public/uploads/ (chỉ hoạt động local/VPS)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Chỉ chấp nhận ảnh (jpg, png, webp, gif). File: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File quá lớn (tối đa 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Strategy 1: Upload lên imgbb (works everywhere including Vercel) ──
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      try {
        const base64 = buffer.toString("base64");
        const imgbbForm = new FormData();
        imgbbForm.append("key", imgbbKey);
        imgbbForm.append("image", base64);
        imgbbForm.append("name", file.name.split(".")[0] || "tinori");

        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: imgbbForm,
        });

        const data = await res.json();
        if (data.success && data.data?.url) {
          console.log(`[UPLOAD] imgbb OK: ${data.data.url}`);
          return NextResponse.json({ url: data.data.url });
        } else {
          console.error("[UPLOAD] imgbb failed:", data);
          throw new Error(data.error?.message || "imgbb upload failed");
        }
      } catch (imgbbErr: any) {
        console.error("[UPLOAD] imgbb error:", imgbbErr.message);
        // Fall through to local storage
      }
    }

    // ── Strategy 2: Save locally (works on local dev / VPS) ──
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      console.log(`[UPLOAD] Local OK: /uploads/${filename}`);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (fsErr) {
      console.error("[UPLOAD] Local filesystem failed:", fsErr);
    }

    // ── Both failed ──
    return NextResponse.json(
      {
        error: "Không thể tải ảnh lên. Vui lòng thêm IMGBB_API_KEY vào biến môi trường Vercel (lấy miễn phí tại imgbb.com).",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[UPLOAD] Error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
