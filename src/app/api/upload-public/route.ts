import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/gif",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "Không có file" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Chỉ chấp nhận file ảnh" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File quá lớn (tối đa 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── imgbb upload (works on Vercel) ──
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      try {
        const base64 = buffer.toString("base64");
        const imgbbForm = new FormData();
        imgbbForm.append("key", imgbbKey);
        imgbbForm.append("image", base64);

        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: imgbbForm,
        });

        const data = await res.json();
        if (data.success && data.data?.url) {
          return NextResponse.json({ url: data.data.url });
        }
      } catch (err) {
        console.error("[UPLOAD-PUBLIC] imgbb error:", err);
      }
    }

    // ── Local fallback ──
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `deposit-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "deposits");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return NextResponse.json({ url: `/uploads/deposits/${filename}` });
    } catch {
      return NextResponse.json({ error: "Không thể lưu file" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[UPLOAD-PUBLIC] Error:", error);
    return NextResponse.json({ error: "Lỗi tải lên" }, { status: 500 });
  }
}
