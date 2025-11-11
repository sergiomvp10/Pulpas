import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/dashboard/stats';
import { ExpiringLots } from '@/components/dashboard/expiring-lots';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { TopProducts } from '@/components/dashboard/top-products';

export const metadata = {
  title: 'Dashboard | Sistema de Gestión de Pulpas',
  description: 'Panel de control del sistema de gestión de pulpas',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Resumen general del sistema de gestión de pulpas
        </p>
      </div>

      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
          <ExpiringLots />
        </Suspense>

        <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
          <TopProducts />
        </Suspense>
      </div>

      <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
        <RecentSales />
      </Suspense>
    </div>
  );
}
