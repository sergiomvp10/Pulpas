import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import { formatDateTimeColombia, nowColombia } from '@/lib/date-utils';
import { RecentSalesCollapsible } from './recent-sales-collapsible';

export async function RecentSales() {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  
  const thirtyDaysAgo = new Date(nowColombia());
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let whereClause: any = {
    status: 'COMPLETED',
    occurredAt: {
      gte: thirtyDaysAgo,
    },
  };

  if (userRole === 'SELLER') {
    const seller = await prisma.seller.findUnique({
      where: { userId },
    });
    
    if (seller) {
      whereClause.sellerId = seller.id;
    }
  }
  
  const recentSales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      customer: true,
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
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
        <CardTitle className="text-xl">Ventas Recientes</CardTitle>
        <RecentSalesCollapsible 
          mostRecentSale={mostRecentSale}
          allSales={recentSales}
        />
      </CardHeader>
    </Card>
  );
}
