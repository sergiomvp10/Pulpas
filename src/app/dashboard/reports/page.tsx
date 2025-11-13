import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/pricing';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DailyRevenueChart } from '@/components/reports/daily-revenue-chart';

export const metadata = {
  title: 'Reportes | Sistema de Gestión de Pulpas',
};

async function SalesReport() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [todaySales, weekSales, monthSales] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        occurredAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: 'COMPLETED',
      },
      _sum: { totalAmountCents: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        occurredAt: { gte: weekStart, lte: weekEnd },
        status: 'COMPLETED',
      },
      _sum: { totalAmountCents: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        occurredAt: { gte: monthStart, lte: monthEnd },
        status: 'COMPLETED',
      },
      _sum: { totalAmountCents: true },
      _count: true,
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Ventas Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(todaySales._sum.totalAmountCents || 0)}</p>
          <p className="text-sm text-gray-500">{todaySales._count} ventas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Esta Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(weekSales._sum.totalAmountCents || 0)}</p>
          <p className="text-sm text-gray-500">{weekSales._count} ventas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Este Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(monthSales._sum.totalAmountCents || 0)}</p>
          <p className="text-sm text-gray-500">{monthSales._count} ventas</p>
        </CardContent>
      </Card>
    </div>
  );
}

async function ProfitReport() {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const sales = await prisma.sale.findMany({
    where: {
      occurredAt: { gte: monthStart, lte: monthEnd },
      status: 'COMPLETED',
    },
    include: {
      saleLines: {
        include: {
          saleLineLots: true,
        },
      },
    },
  });

  let totalRevenue = 0;
  let totalCost = 0;

  const dailyRevenueMap = new Map<number, number>();
  
  const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  allDaysInMonth.forEach(day => {
    dailyRevenueMap.set(day.getDate(), 0);
  });

  for (const sale of sales) {
    totalRevenue += sale.totalAmountCents;
    
    const saleDay = new Date(sale.occurredAt).getDate();
    dailyRevenueMap.set(saleDay, (dailyRevenueMap.get(saleDay) || 0) + sale.totalAmountCents);
    
    for (const line of sale.saleLines) {
      for (const lot of line.saleLineLots) {
        totalCost += lot.quantityUnits * lot.costUnitCentsAtSale;
      }
    }
  }

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const dailyData = Array.from(dailyRevenueMap.entries())
    .map(([day, revenue]) => ({ day, revenue }))
    .sort((a, b) => a.day - b.day);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilidad del Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Costos</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Ganancia</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(profit)}</p>
              <p className="text-sm text-gray-500">Margen: {margin.toFixed(1)}%</p>
            </div>
          </div>
          <div className="border-l pl-6">
            <DailyRevenueChart dailyData={dailyData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-gray-500">Análisis de ventas y rentabilidad</p>
      </div>

      <Suspense fallback={<div>Cargando reportes de ventas...</div>}>
        <SalesReport />
      </Suspense>

      <Suspense fallback={<div>Cargando reporte de rentabilidad...</div>}>
        <ProfitReport />
      </Suspense>
    </div>
  );
}
