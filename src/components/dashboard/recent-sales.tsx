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
        <CardTitle className="text-xl">Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSales.length === 0 ? (
          <p className="text-base text-gray-500 py-4">No hay ventas registradas</p>
        ) : (
          <div className="space-y-5">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <p className="text-base font-semibold">
                    {sale.customer?.name || 'Cliente sin nombre'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sale.saleLines.map((line) => 
                      `${line.productVariant.productBase.name} ${line.productVariant.gramWeightG}g (${line.quantityUnits})`
                    ).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(sale.occurredAt, "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {formatCurrency(sale.totalAmountCents)}
                  </p>
                  <Badge variant="outline" className="mt-1 text-sm">
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
