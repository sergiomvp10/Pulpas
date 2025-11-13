import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createSellerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sellers = await prisma.seller.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSellerSchema.parse(body);

    const seller = await prisma.seller.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        commissionRate: validatedData.commissionRate || 0,
      },
    });

    return NextResponse.json(seller, { status: 201 });
  } catch (error) {
    console.error('Error creating seller:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create seller' }, { status: 500 });
  }
}
