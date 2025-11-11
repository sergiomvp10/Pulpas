import { addMonths, format } from 'date-fns';

export interface LotCodeParams {
  productSku: string;
  productionDate: Date;
  sequenceNumber?: number;
}

export function generateLotCode(params: LotCodeParams): string {
  const { productSku, productionDate, sequenceNumber = 1 } = params;
  const dateStr = format(productionDate, 'yyyy-MM-dd');
  return `${productSku}-${dateStr}-L${sequenceNumber}`;
}

export function calculateExpiryDate(
  productionDate: Date,
  shelfLifeMonths: number = 7
): Date {
  return addMonths(productionDate, shelfLifeMonths);
}

interface PrismaLotClient {
  lot: {
    findMany: (args: {
      where: { productVariantId: string; productionDate: Date };
      select: { code: true };
    }) => Promise<Array<{ code: string }>>;
  };
}

export async function getNextLotSequence(
  prisma: PrismaLotClient,
  productVariantId: string,
  productionDate: Date
): Promise<number> {
  const existingLots = await prisma.lot.findMany({
    where: {
      productVariantId,
      productionDate,
    },
    select: {
      code: true,
    },
  });

  if (existingLots.length === 0) {
    return 1;
  }

  const sequences = existingLots
    .map((lot) => {
      const match = lot.code.match(/-L(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((seq) => !isNaN(seq));

  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
}
