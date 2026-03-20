import type { Lot } from '@prisma/client';

export interface LotAllocation {
  lotId: string;
  quantityUnits: number;
  costPerUnitCents: number;
}

export interface FEFOResult {
  allocations: LotAllocation[];
  totalAllocated: number;
  remainingQuantity: number;
}

export function allocateLotsWithFEFO(
  availableLots: Lot[],
  requestedQuantity: number
): FEFOResult {
  const sortedLots = [...availableLots]
    .filter(lot => lot.status === 'APPROVED' && lot.unitsOnHand > 0)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const allocations: LotAllocation[] = [];
  let remainingQuantity = requestedQuantity;

  for (const lot of sortedLots) {
    if (remainingQuantity <= 0) break;

    const quantityToAllocate = Math.min(lot.unitsOnHand, remainingQuantity);

    allocations.push({
      lotId: lot.id,
      quantityUnits: quantityToAllocate,
      costPerUnitCents: lot.costPerUnitCents,
    });

    remainingQuantity -= quantityToAllocate;
  }

  return {
    allocations,
    totalAllocated: requestedQuantity - remainingQuantity,
    remainingQuantity,
  };
}

export function calculateTotalCost(allocations: LotAllocation[]): number {
  return allocations.reduce(
    (total, allocation) => total + allocation.quantityUnits * allocation.costPerUnitCents,
    0
  );
}
