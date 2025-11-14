import { Suspense } from 'react';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/dashboard/stats';
import { LowStock } from '@/components/dashboard/low-stock';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { TopProducts } from '@/components/dashboard/top-products';

export const metadata = {
  title: 'Dashboard | Sistema de Gestión de Pulpas',
  description: 'Panel de control del sistema de gestión de pulpas',
};

export default async function DashboardPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  const isSeller = userRole === 'SELLER';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-gray-500 mt-2">
          {isSeller ? 'Mis ventas y clientes' : 'Resumen general del sistema de gestión de pulpas'}
        </p>
      </div>

      {!isSeller && (
        <>
          <Suspense fallback={<div>Cargando estadísticas...</div>}>
            <DashboardStats />
          </Suspense>

          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
              <LowStock />
            </Suspense>

            <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
              <TopProducts />
            </Suspense>
          </div>
        </>
      )}

      <Suspense fallback={<Card><CardContent className="p-6">Cargando...</CardContent></Card>}>
        <RecentSales />
      </Suspense>
    </div>
  );
}
