import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { formatDateShortColombia, nowColombia } from '@/lib/date-utils';

export async function ExpiringLots() {
  const now = nowColombia();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringLots = await prisma.lot.findMany({
    where: {
      status: 'APPROVED',
      unitsOnHand: { gt: 0 },
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: now,
      },
    },
    include: {
      productVariant: {
        include: {
          productBase: true,
        },
      },
    },
    orderBy: {
      expiryDate: 'asc',
    },
    take: 5,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes Próximos a Vencer</CardTitle>
      </CardHeader>
      <CardContent>
        {expiringLots.length === 0 ? (
          <p className="text-sm text-gray-500">No hay lotes próximos a vencer</p>
        ) : (
          <div className="space-y-4">
            {expiringLots.map((lot) => {
              const daysUntilExpiry = differenceInDays(lot.expiryDate, nowColombia());
              const isUrgent = daysUntilExpiry <= 7;

              return (
                <div key={lot.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {lot.productVariant.productBase.name} {lot.productVariant.gramWeightG}g
                    </p>
                    <p className="text-xs text-gray-500">
                      Lote: {lot.code} | {lot.unitsOnHand} unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                      {daysUntilExpiry} días
                    </Badge>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateShortColombia(lot.expiryDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
