import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const lot = await prisma.lot.findUnique({
      where: { id },
      include: {
        productVariant: {
          include: {
            productBase: true,
          },
        },
        location: true,
      },
    });

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error('Error fetching lot:', error);
    return NextResponse.json({ error: 'Failed to fetch lot' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { unitsOnHand, costPerUnitCents, locationId, notes, status } = body;

    const existingLot = await prisma.lot.findUnique({
      where: { id },
    });

    if (!existingLot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    
    if (unitsOnHand !== undefined) {
      updateData.unitsOnHand = unitsOnHand;
    }
    if (costPerUnitCents !== undefined) {
      updateData.costPerUnitCents = costPerUnitCents;
    }
    if (locationId !== undefined) {
      updateData.locationId = locationId || null;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const lot = await prisma.$transaction(async (tx) => {
      const updatedLot = await tx.lot.update({
        where: { id },
        data: updateData,
        include: {
          productVariant: {
            include: {
              productBase: true,
            },
          },
          location: true,
        },
      });

      // If units changed, create an inventory movement record
      if (unitsOnHand !== undefined && unitsOnHand !== existingLot.unitsOnHand) {
        const difference = unitsOnHand - existingLot.unitsOnHand;
        await tx.inventoryMovement.create({
          data: {
            lotId: id,
            type: difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
            quantityUnits: difference,
            referenceType: 'SYSTEM',
            notes: 'Ajuste manual de inventario',
            createdById: session.user.id,
          },
        });
      }

      return updatedLot;
    });

    return NextResponse.json(lot);
  } catch (error) {
    console.error('Error updating lot:', error);
    return NextResponse.json({ error: 'Failed to update lot' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingLot = await prisma.lot.findUnique({
      where: { id },
      include: {
        saleLineLots: true,
      },
    });

    if (!existingLot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Check if lot has been used in any sales
    if (existingLot.saleLineLots.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un lote que ya tiene ventas asociadas' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete inventory movements first
      await tx.inventoryMovement.deleteMany({
        where: { lotId: id },
      });

      // Delete QC checks if any
      await tx.qCCheck.deleteMany({
        where: { lotId: id },
      });

      // Delete the lot
      await tx.lot.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lot:', error);
    return NextResponse.json({ error: 'Failed to delete lot' }, { status: 500 });
  }
}
