import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active");

  const banners = await prisma.banner.findMany({
    where: {
      ...(active === "true" && { active: true }),
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { image, link, active, order } = body;

  if (!image) {
    return NextResponse.json({ error: "Thiếu ảnh banner" }, { status: 400 });
  }

  const banner = await prisma.banner.create({
    data: {
      image,
      link,
      active: active ?? true,
      order: order ?? 0,
    },
  });

  return NextResponse.json(banner, { status: 201 });
}
