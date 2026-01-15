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
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, category, amountCents, paymentMethod, expenseDate, notes } = body;

    if (!description || !category || !amountCents || !paymentMethod || !expenseDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the maximum expense number sequence by scanning existing expenses
    // This handles cases where some expense numbers don't match the G-###### pattern
    const existingExpenses = await prisma.expense.findMany({
      select: { expenseNumber: true },
    });

    let maxSequence = 0;
    for (const expense of existingExpenses) {
      const match = expense.expenseNumber?.match(/^G-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }

    const nextSequence = maxSequence + 1;
    const expenseNumber = `G-${String(nextSequence).padStart(6, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        description,
        category,
        amountCents,
        paymentMethod,
        expenseDate: new Date(expenseDate),
        notes: notes || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
