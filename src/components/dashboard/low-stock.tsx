import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_THRESHOLD = 5;

export async function LowStock() {
  const lowStockVariants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
    },
    include: {
      productBase: true,
      lots: {
        where: {
          status: 'APPROVED',
          unitsOnHand: { gt: 0 },
        },
      },
    },
  });

  const variantsWithStock = lowStockVariants
    .map((variant) => {
      const totalStock = variant.lots.reduce((sum, lot) => sum + lot.unitsOnHand, 0);
      return {
        ...variant,
        totalStock,
      };
    })
    .filter((variant) => variant.totalStock <= LOW_STOCK_THRESHOLD && variant.totalStock > 0)
    .sort((a, b) => a.totalStock - b.totalStock)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos con Poco Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        {variantsWithStock.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todos los productos tienen inventario suficiente
          </p>
        ) : (
          <div className="space-y-4">
            {variantsWithStock.map((variant) => {
              const isCritical = variant.totalStock <= CRITICAL_STOCK_THRESHOLD;

              return (
                <div key={variant.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {variant.productBase.name} {variant.gramWeightG}g
                    </p>
                    <p className="text-xs text-gray-500">
                      SKU: {variant.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isCritical ? 'destructive' : 'secondary'}>
                      {variant.totalStock} {variant.totalStock === 1 ? 'unidad' : 'unidades'}
                    </Badge>
                    <p className="mt-1 text-xs text-gray-500">
                      {isCritical ? '¡Stock crítico!' : 'Stock bajo'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
