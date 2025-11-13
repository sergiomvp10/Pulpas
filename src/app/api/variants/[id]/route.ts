import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateVariantSchema = z.object({
  pricePerUnit: z.number().min(0).optional(),
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
    const validatedData = updateVariantSchema.parse(body);

    const variant = await prisma.productVariant.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}
