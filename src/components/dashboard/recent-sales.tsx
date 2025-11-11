import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function RecentSales() {
  const recentSales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      customer: true,
      saleLines: {
        include: {
          productVariant: {
            include: {
              productBase: true,
            },
          },
        },
      },
    },
    orderBy: {
      occurredAt: 'desc',
    },
    take: 10,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSales.length === 0 ? (
          <p className="text-sm text-gray-500">No hay ventas registradas</p>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {sale.customer?.name || 'Cliente sin nombre'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sale.saleLines.map((line) => 
                      `${line.productVariant.productBase.name} ${line.productVariant.gramWeightG}g (${line.quantityUnits})`
                    ).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(sale.occurredAt, "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(sale.totalAmountCents)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {sale.paymentMethod}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
