import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/pricing';

export async function DashboardStats() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalProducts,
    totalLots,
    lotsExpiringSoon,
    todaySales,
  ] = await Promise.all([
    prisma.productVariant.count({ where: { active: true } }),
    prisma.lot.count({ where: { status: 'APPROVED', unitsOnHand: { gt: 0 } } }),
    prisma.lot.count({
      where: {
        status: 'APPROVED',
        unitsOnHand: { gt: 0 },
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: now,
        },
      },
    }),
    prisma.sale.aggregate({
      where: {
        occurredAt: {
          gte: todayStart,
        },
        status: 'COMPLETED',
      },
      _sum: {
        totalAmountCents: true,
      },
    }),
  ]);

  const stats = [
    {
      title: 'Productos Activos',
      value: totalProducts.toString(),
      description: 'Variantes de productos disponibles',
    },
    {
      title: 'Lotes en Stock',
      value: totalLots.toString(),
      description: 'Lotes con unidades disponibles',
    },
    {
      title: 'Próximos a Vencer',
      value: lotsExpiringSoon.toString(),
      description: 'Lotes que vencen en 30 días',
      alert: lotsExpiringSoon > 0,
    },
    {
      title: 'Ventas Hoy',
      value: formatCurrency(todaySales._sum.totalAmountCents || 0),
      description: 'Total de ventas del día',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.alert ? 'text-red-600' : ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
