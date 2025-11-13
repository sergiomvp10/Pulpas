import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import { formatDateTimeColombia, nowColombia } from '@/lib/date-utils';
import { RecentSalesCollapsible } from './recent-sales-collapsible';

export async function RecentSales() {
  const thirtyHoursAgo = new Date(nowColombia().getTime() - 36 * 60 * 60 * 1000);
  
  const recentSales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
      occurredAt: {
        gte: thirtyHoursAgo,
      },
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
  });

  const mostRecentSale = recentSales[0];

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="text-xl">Ventas Recientes (últimas 36 horas)</CardTitle>
        <RecentSalesCollapsible 
          mostRecentSale={mostRecentSale}
          allSales={recentSales}
        />
      </CardHeader>
    </Card>
  );
}
