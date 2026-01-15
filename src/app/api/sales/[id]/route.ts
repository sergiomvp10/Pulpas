import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { allocateLotsWithFEFO } from '@/lib/fefo';

interface SaleLineInput {
  id?: string;
  productVariantId: string;
  quantity: number;
  unitPriceCents: number;
}

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

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        saleLines: {
          include: {
            productVariant: {
              include: {
                productBase: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            saleLineLots: {
              include: {
                lot: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { error: 'Error al obtener la venta' },
      { status: 500 }
    );
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
    const { lines, customerId, paymentMethod } = body;

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos una línea de venta' }, { status: 400 });
    }

    const updatedSale = await prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findUnique({
        where: { id },
        include: {
          saleLines: {
            include: {
              saleLineLots: true,
            },
          },
        },
      });

      if (!existingSale) {
        throw new Error('Venta no encontrada');
      }

      if (existingSale.status === 'VOID') {
        throw new Error('No se puede editar una venta anulada');
      }

      for (const existingLine of existingSale.saleLines) {
        for (const saleLineLot of existingLine.saleLineLots) {
          await tx.lot.update({
            where: { id: saleLineLot.lotId },
            data: {
              unitsOnHand: {
                increment: saleLineLot.quantityUnits,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              lotId: saleLineLot.lotId,
              type: 'ADJUSTMENT_IN',
              quantityUnits: saleLineLot.quantityUnits,
              referenceType: 'SALE',
              referenceId: id,
              notes: `Devolución por edición de venta ${existingSale.saleNumber}`,
              createdById: session.user.id,
            },
          });
        }
      }

      await tx.saleLineLot.deleteMany({
        where: {
          saleLine: {
            saleId: id,
          },
        },
      });

      await tx.saleLine.deleteMany({
        where: { saleId: id },
      });

      let totalAmountCents = 0;

      for (const line of lines as SaleLineInput[]) {
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

        const subtotalCents = line.quantity * line.unitPriceCents;
        totalAmountCents += subtotalCents;

        const saleLine = await tx.saleLine.create({
          data: {
            saleId: id,
            productVariantId: line.productVariantId,
            quantityUnits: line.quantity,
            unitPriceCents: line.unitPriceCents,
            subtotalCents,
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
              referenceId: id,
              notes: `Venta editada ${existingSale.saleNumber}`,
              createdById: session.user.id,
            },
          });
        }
      }

      const updated = await tx.sale.update({
        where: { id },
        data: {
          totalAmountCents,
          customerId: customerId || null,
          paymentMethod: paymentMethod || existingSale.paymentMethod,
        },
        include: {
          customer: true,
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          saleLines: {
            include: {
              productVariant: {
                include: {
                  productBase: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la venta';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
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

    const result = await prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findUnique({
        where: { id },
        include: {
          saleLines: {
            include: {
              saleLineLots: true,
            },
          },
        },
      });

      if (!existingSale) {
        throw new Error('Venta no encontrada');
      }

      if (existingSale.status === 'VOID') {
        throw new Error('La venta ya está anulada');
      }

      for (const line of existingSale.saleLines) {
        for (const saleLineLot of line.saleLineLots) {
          await tx.lot.update({
            where: { id: saleLineLot.lotId },
            data: {
              unitsOnHand: {
                increment: saleLineLot.quantityUnits,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              lotId: saleLineLot.lotId,
              type: 'ADJUSTMENT_IN',
              quantityUnits: saleLineLot.quantityUnits,
              referenceType: 'SALE',
              referenceId: id,
              notes: `Devolución por eliminación de venta ${existingSale.saleNumber}`,
              createdById: session.user.id,
            },
          });
        }
      }

      const voidedSale = await tx.sale.update({
        where: { id },
        data: {
          status: 'VOID',
        },
      });

      return voidedSale;
    });

    return NextResponse.json({ 
      message: 'Venta eliminada correctamente',
      sale: result 
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la venta';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
