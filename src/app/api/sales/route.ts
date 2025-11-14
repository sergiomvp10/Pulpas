import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { allocateLotsWithFEFO } from '@/lib/fefo';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, paymentMethod, lines } = body;

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: 'No sale lines provided' }, { status: 400 });
    }

    interface SaleLine {
      productVariantId: string;
      quantity: number;
      unitPriceCents: number;
    }

    const sale = await prisma.$transaction(async (tx) => {
      const saleCount = await tx.sale.count();
      const saleNumber = `V-${String(saleCount + 1).padStart(6, '0')}`;

      const totalAmountCents = (lines as SaleLine[]).reduce(
        (sum: number, line: SaleLine) => sum + line.quantity * line.unitPriceCents,
        0
      );

      let sellerId = null;
      if (session.user.role === 'SELLER') {
        const seller = await tx.seller.findUnique({
          where: { userId: session.user.id },
        });
        if (seller) {
          sellerId = seller.id;
        }
      } else if (session.user.role === 'ADMIN' && body.sellerId) {
        const seller = await tx.seller.findUnique({
          where: { id: body.sellerId, active: true },
        });
        if (seller) {
          sellerId = seller.id;
        }
      }

      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: customerId || null,
          sellerId,
          paymentMethod,
          totalAmountCents,
          status: 'COMPLETED',
          createdById: session.user.id,
        },
      });

      for (const line of lines as SaleLine[]) {
        const availableLots = await tx.lot.findMany({
          where: {
            productVariantId: line.productVariantId,
            status: 'APPROVED',
            unitsOnHand: { gt: 0 },
            expiryDate: { gte: new Date() },
          },
          orderBy: { expiryDate: 'asc' },
        });

        const allocation = allocateLotsWithFEFO(availableLots, line.quantity);

        if (allocation.remainingQuantity > 0) {
          throw new Error(
            `Stock insuficiente para el producto. Disponible: ${allocation.totalAllocated}, Requerido: ${line.quantity}`
          );
        }

        const saleLine = await tx.saleLine.create({
          data: {
            saleId: newSale.id,
            productVariantId: line.productVariantId,
            quantityUnits: line.quantity,
            unitPriceCents: line.unitPriceCents,
            subtotalCents: line.quantity * line.unitPriceCents,
          },
        });

        for (const alloc of allocation.allocations) {
          await tx.saleLineLot.create({
            data: {
              saleLineId: saleLine.id,
              lotId: alloc.lotId,
              quantityUnits: alloc.quantityUnits,
              costUnitCentsAtSale: alloc.costPerUnitCents,
            },
          });

          await tx.lot.update({
            where: { id: alloc.lotId },
            data: {
              unitsOnHand: {
                decrement: alloc.quantityUnits,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              lotId: alloc.lotId,
              type: 'SALE_OUT',
              quantityUnits: -alloc.quantityUnits,
              referenceType: 'SALE',
              referenceId: newSale.id,
              createdById: session.user.id,
            },
          });
        }
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create sale';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
