import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    const skuRoot = validatedData.name.toUpperCase().replace(/\s+/g, '-');

    const existingProduct = await prisma.productBase.findUnique({
      where: { skuRoot },
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'Ya existe un producto con este nombre' }, { status: 400 });
    }

    const weights = [125, 250, 500, 1000];
    
    const product = await prisma.productBase.create({
      data: {
        name: validatedData.name,
        categoryId: validatedData.categoryId,
        skuRoot,
        variants: {
          create: weights.map((weight) => ({
            gramWeightG: weight,
            sku: `${skuRoot}-${weight}`,
            pricePerUnit: weight * category.pricePerGram,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
