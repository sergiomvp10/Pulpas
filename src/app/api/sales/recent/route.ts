import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Get sales from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build where clause - filter by seller for SELLER role
    let whereClause: any = {
      status: 'COMPLETED',
      occurredAt: {
        gte: thirtyDaysAgo,
      },
    };

    // If user is a SELLER, only show their own sales
    if (userRole === 'SELLER') {
      const seller = await prisma.seller.findUnique({
        where: { userId },
      });
      
      if (seller) {
        whereClause.sellerId = seller.id;
      }
    }

    const recentSales = await prisma.sale.findMany({
      where: whereClause,
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
