import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateSellerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateSellerSchema.parse(body);

    const seller = await prisma.seller.update({
      where: { id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
      },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error updating seller:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const seller = await prisma.seller.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Seller deactivated successfully', seller });
  } catch (error) {
    console.error('Error deactivating seller:', error);
    return NextResponse.json({ error: 'Failed to deactivate seller' }, { status: 500 });
  }
}
