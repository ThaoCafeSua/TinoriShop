import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "thanhthaooo099@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "@Thao2004";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists" });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        role: "admin",
      },
    });

    return NextResponse.json({ 
      message: "Admin created successfully!",
      email: adminEmail
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
