import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    const where = showAll
      ? {}
      : {
          status: 'APPROVED' as const,
          unitsOnHand: { gt: 0 },
        };

    const lots = await prisma.lot.findMany({
      where,
      include: {
        productVariant: {
          include: {
            productBase: true,
          },
        },
        location: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return NextResponse.json(lots);
  } catch (error) {
    console.error('Error fetching lots:', error);
    return NextResponse.json({ error: 'Failed to fetch lots' }, { status: 500 });
  }
}
