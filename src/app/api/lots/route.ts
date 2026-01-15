import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { calculateExpiryDate, generateLotCode } from '@/lib/lot';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productVariantId,
      productionDate,
      unitsInitial,
      costPerUnitCents,
      locationId,
      notes,
    } = body;

    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { productBase: true },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
    }

    const shelfLifeSetting = await prisma.settings.findUnique({
      where: { key: 'default_shelf_life_months' },
    });
    const shelfLifeMonths = shelfLifeSetting ? parseInt(shelfLifeSetting.value) : 7;

    const prodDate = new Date(productionDate);
    const expiryDate = calculateExpiryDate(prodDate, shelfLifeMonths);

    const dateStr = format(prodDate, 'yyyy-MM-dd');
    const codePrefix = `${variant.productBase.skuRoot}-${dateStr}-L`;
    
    const existingLots = await prisma.lot.findMany({
      where: {
        code: {
          startsWith: codePrefix,
        },
      },
      select: {
        code: true,
      },
    });

    const sequences = existingLots
      .map((lot) => {
        const match = lot.code.match(/-L(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((seq) => !isNaN(seq) && seq > 0);

    const sequenceNumber = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;

    const code = generateLotCode({
      productSku: variant.productBase.skuRoot,
      productionDate: prodDate,
      sequenceNumber,
    });

    const lot = await prisma.$transaction(async (tx: any) => {
      const newLot = await tx.lot.create({
        data: {
          code,
          productVariantId,
          productionDate: prodDate,
          expiryDate,
          unitsInitial,
          unitsOnHand: unitsInitial,
          costPerUnitCents,
          status: 'APPROVED',
          locationId: locationId || null,
          notes,
          createdById: session.user.id,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          lotId: newLot.id,
          type: 'PRODUCTION_IN',
          quantityUnits: unitsInitial,
          referenceType: 'SYSTEM',
          notes: 'Producción inicial',
          createdById: session.user.id,
        },
      });

      return newLot;
    });

    return NextResponse.json(lot, { status: 201 });
  } catch (error) {
    console.error('Error creating lot:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create lot',
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        meta: (error as any)?.meta,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
