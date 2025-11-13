import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
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
    const validatedData = updateProductSchema.parse(body);

    const product = await prisma.productBase.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.productBase.update({
      where: { id: params.id },
      data: { active: false },
    });

    await prisma.productVariant.updateMany({
      where: { productBaseId: params.id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Product deactivated successfully', product });
  } catch (error) {
    console.error('Error deactivating product:', error);
    return NextResponse.json({ error: 'Failed to deactivate product' }, { status: 500 });
  }
}
