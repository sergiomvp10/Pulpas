import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/pricing';

export const metadata = {
  title: 'Inventario | Sistema de Gestión de Pulpas',
};

async function InventoryList() {
  const lots = await prisma.lot.findMany({
    where: {
      status: 'APPROVED',
      unitsOnHand: { gt: 0 },
    },
    include: {
      productVariant: {
        include: {
          productBase: true,
        },
      },
      location: true,
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });

  return (
    <div className="space-y-4">
      {lots.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No hay lotes en inventario</p>
          </CardContent>
        </Card>
      ) : (
        lots.map((lot) => {
          const daysUntilExpiry = differenceInDays(lot.expiryDate, new Date());
          const isExpiringSoon = daysUntilExpiry <= 30;
          const isExpired = daysUntilExpiry < 0;

          return (
            <Card key={lot.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {lot.productVariant.productBase.name} {lot.productVariant.gramWeightG}g
                    </CardTitle>
                    <p className="text-sm text-gray-500">Lote: {lot.code}</p>
                  </div>
                  <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'outline'}>
                    {isExpired ? 'Vencido' : `${daysUntilExpiry} días`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Unidades Disponibles</p>
                    <p className="text-lg font-bold">{lot.unitsOnHand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Costo Unitario</p>
                    <p className="text-lg font-bold">{formatCurrency(lot.costPerUnitCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Producción</p>
                    <p className="text-sm">{format(lot.productionDate, 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                    <p className="text-sm">{format(lot.expiryDate, 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                </div>
                {lot.location && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="text-sm">{lot.location.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-gray-500">Control de lotes y stock disponible</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/new">Añadir Producción</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando inventario...</div>}>
        <InventoryList />
      </Suspense>
    </div>
  );
}
