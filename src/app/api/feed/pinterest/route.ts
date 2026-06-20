import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
        },
      },
    });

    // Define CSV headers
    const headers = [
      "id",
      "title",
      "description",
      "link",
      "image_link",
      "price",
      "availability",
      "condition",
    ];

    // Helper to escape CSV fields
    const escapeCSV = (field: string | null | undefined) => {
      if (!field) return "";
      const stringField = String(field);
      if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tinori.vercel.app";

    const rows = products.map((product) => {
      const imageUrl = product.images.length > 0 ? product.images[0].url : `${baseUrl}/placeholder.png`;
      const productLink = `${baseUrl}/product/${product.slug}`;
      const description = product.description || `Sản phẩm ${product.name} chính hãng từ Tinori.`;
      // Pinterest availability enum: 'in stock', 'out of stock', 'preorder'
      const availability = product.stock > 0 ? "in stock" : "out of stock";
      const price = `${product.price} VND`;
      const condition = "new";

      return [
        escapeCSV(product.id),
        escapeCSV(product.name),
        escapeCSV(description),
        escapeCSV(productLink),
        escapeCSV(imageUrl),
        escapeCSV(price),
        escapeCSV(availability),
        escapeCSV(condition),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pinterest-feed.csv"',
      },
    });
  } catch (error) {
    console.error("Error generating Pinterest feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
