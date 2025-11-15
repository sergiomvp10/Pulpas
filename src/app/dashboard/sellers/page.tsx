import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SellerActions } from '@/components/sellers/seller-actions';
import { SellerCardWithReport } from '@/components/sellers/seller-card-with-report';

export const metadata = {
  title: 'Vendedores | FrutyLab',
  description: 'Gestión de vendedores',
};

async function SellersList() {
  const sellers = await prisma.seller.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  if (sellers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            No hay vendedores registrados. Haz clic en &quot;Añadir Vendedor&quot; para crear uno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller: any) => (
        <SellerCardWithReport key={seller.id} seller={seller} />
      ))}
    </div>
  );
}

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
          <p className="text-gray-500">
            Gestión de vendedores y comisiones
          </p>
        </div>
        <Link href="/dashboard/sellers/new">
          <Button size="lg">
            Añadir Vendedor
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando vendedores...</div>}>
        <SellersList />
      </Suspense>
    </div>
  );
}
