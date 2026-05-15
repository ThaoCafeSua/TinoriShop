import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Thiếu email" }, { status: 400 });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tinori Test 🎀" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Test Email từ Tinori Shop",
      text: "Chúc mừng! Hệ thống email của bạn đang hoạt động tốt. ✨",
      html: "<b>Chúc mừng!</b> Hệ thống email của bạn đang hoạt động tốt. ✨",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
