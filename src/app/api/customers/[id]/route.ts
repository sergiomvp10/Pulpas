import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().optional(),
  city: z.string().optional(),
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
    const validatedData = updateCustomerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        city: validatedData.city || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
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
    const customer = await prisma.customer.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Customer deactivated successfully', customer });
  } catch (error) {
    console.error('Error deactivating customer:', error);
    return NextResponse.json({ error: 'Failed to deactivate customer' }, { status: 500 });
  }
}
