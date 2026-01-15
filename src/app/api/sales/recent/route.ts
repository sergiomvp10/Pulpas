import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sales from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.sale.findMany({
      where: {
        status: 'COMPLETED',
        occurredAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        customer: true,
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        saleLines: {
          include: {
            productVariant: {
              include: {
                productBase: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });

    return NextResponse.json(recentSales);
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent sales' },
      { status: 500 }
    );
  }
}
