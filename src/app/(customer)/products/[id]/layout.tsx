import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        images: true,
      }
    });

    if (!product) {
      return {
        title: 'Sản phẩm không tồn tại - Tinori Shop',
      };
    }

    const title = `${product.name} | Tinori Shop`;
    const description = product.description?.substring(0, 160) || `Mua sắm ${product.name} tại Tinori Shop với giá tốt nhất!`;
    const image = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Sản phẩm - Tinori Shop',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
