import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        active: true,
        productBase: {
          active: true,
        },
      },
      include: {
        productBase: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        {
          productBase: {
            name: 'asc',
          },
        },
        {
          gramWeightG: 'asc',
        },
      ],
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return NextResponse.json(
      { error: 'Error al obtener las variantes de productos' },
      { status: 500 }
    );
  }
}
