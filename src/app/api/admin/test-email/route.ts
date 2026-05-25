import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Thiếu email" }, { status: 400 });

    // Debug: kiểm tra biến môi trường
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({
        error: `SMTP chưa được cấu hình. SMTP_USER: ${smtpUser ? "✅ có" : "❌ thiếu"}, SMTP_PASS: ${smtpPass ? "✅ có" : "❌ thiếu"}. Vào Vercel > Settings > Environment Variables để thêm.`,
      }, { status: 400 });
    }

    console.log(`[TEST-EMAIL] Attempting: host=${smtpHost}, port=${smtpPort}, user=${smtpUser}, to=${email}`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection first
    await transporter.verify();
    console.log("[TEST-EMAIL] SMTP connection verified OK");

    await transporter.sendMail({
      from: `"Tinori Test 🎀" <${smtpUser}>`,
      to: email,
      subject: "✅ Test Email từ Tinori Shop",
      text: "Chúc mừng! Hệ thống email của bạn đang hoạt động tốt. ✨",
      html: `
        <div style="font-family:Arial;max-width:400px;margin:20px auto;padding:24px;background:#fdf2f8;border-radius:16px;text-align:center;">
          <h2 style="color:#d53c83;">🎀 Tinori Shop</h2>
          <p style="font-size:16px;color:#333;"><b>Chúc mừng!</b> Hệ thống email đang hoạt động tốt. ✨</p>
          <p style="font-size:12px;color:#999;">Gửi từ: ${smtpUser}</p>
          <p style="font-size:12px;color:#999;">Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
        </div>
      `,
    });

    console.log(`[TEST-EMAIL] SUCCESS: sent to ${email}`);
    return NextResponse.json({ success: true, message: `Đã gửi email test đến ${email}` });
  } catch (error: any) {
    console.error("[TEST-EMAIL] ERROR:", error);

    // Cung cấp thông tin lỗi chi tiết hơn
    let friendlyError = error.message;
    if (error.code === "EAUTH") {
      friendlyError = "Sai mật khẩu ứng dụng Gmail (App Password). Vào myaccount.google.com > Security > App Passwords để tạo mật khẩu mới.";
    } else if (error.code === "ESOCKET" || error.code === "ECONNECTION") {
      friendlyError = "Không kết nối được tới máy chủ SMTP. Kiểm tra SMTP_HOST và SMTP_PORT.";
    } else if (error.responseCode === 535) {
      friendlyError = "Xác thực SMTP thất bại. Kiểm tra lại SMTP_USER và SMTP_PASS trên Vercel.";
    }

    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
