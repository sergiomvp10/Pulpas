import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    
    const whereClause: { active: boolean; createdBySellerId?: string } = { active: true };
    
    if (user.role === 'SELLER') {
      const seller = await prisma.seller.findUnique({
        where: { userId: user.id },
      });
      
      if (seller) {
        whereClause.createdBySellerId = seller.id;
      } else {
        return NextResponse.json([]);
      }
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        createdBySeller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    const body = await request.json();
    const validatedData = createCustomerSchema.parse(body);

    let createdBySellerId: string | null = null;
    
    if (user.role === 'SELLER') {
      const seller = await prisma.seller.findUnique({
        where: { userId: user.id },
      });
      if (seller) {
        createdBySellerId = seller.id;
      }
    }

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        city: validatedData.city || null,
        createdBySellerId,
      },
      include: {
        createdBySeller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
