import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1),
  targetValue: z.number().min(1),
  goalType: z.enum(['SALES_COUNT', 'SALES_AMOUNT', 'NEW_CUSTOMERS']),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };

    if (user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Only sellers can access goals' }, { status: 403 });
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const goals = await prisma.sellerGoal.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const salesCount = await prisma.sale.count({
      where: {
        sellerId: seller.id,
        occurredAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
    });

    const salesTotal = await prisma.sale.aggregate({
      where: {
        sellerId: seller.id,
        occurredAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
      _sum: {
        totalAmountCents: true,
      },
    });

    const newCustomers = await prisma.customer.count({
      where: {
        createdBySellerId: seller.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return NextResponse.json({
      goals,
      stats: {
        salesCount,
        salesTotal: salesTotal._sum.totalAmountCents || 0,
        newCustomers,
        currentMonth: now.toLocaleString('es-CO', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (error) {
    console.error('Error fetching seller goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };

    if (user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Only sellers can create goals' }, { status: 403 });
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createGoalSchema.parse(body);

    const goal = await prisma.sellerGoal.create({
      data: {
        sellerId: seller.id,
        title: validatedData.title,
        targetValue: validatedData.targetValue,
        goalType: validatedData.goalType,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
