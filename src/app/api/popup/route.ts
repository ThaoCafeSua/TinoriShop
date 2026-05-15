import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const popup = await prisma.popup.findFirst();
    return NextResponse.json(popup || null);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải popup" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const existing = await prisma.popup.findFirst();

    let popup;
    if (existing) {
      popup = await prisma.popup.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          image: data.image,
          link: data.link,
          active: data.active
        }
      });
    } else {
      popup = await prisma.popup.create({
        data: {
          title: data.title,
          image: data.image,
          link: data.link,
          active: data.active
        }
      });
    }

    return NextResponse.json(popup);
  } catch (error) {
    console.error("Popup Error:", error);
    return NextResponse.json({ error: "Lỗi lưu popup" }, { status: 500 });
  }
}
