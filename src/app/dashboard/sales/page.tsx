import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RecentSales } from '@/components/dashboard/recent-sales';

export const metadata = {
  title: 'Ventas | FrutyLab',
};

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
          <p className="text-gray-500">Registro y gestión de ventas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sales/new">Registrar Venta</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando ventas...</div>}>
        <RecentSales />
      </Suspense>
    </div>
  );
}
