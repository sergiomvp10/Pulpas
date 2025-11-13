import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function TopProducts() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const topProducts = await prisma.saleLine.groupBy({
    by: ['productVariantId'],
    where: {
      sale: {
        occurredAt: {
          gte: thirtyDaysAgo,
        },
        status: 'COMPLETED',
      },
    },
    _sum: {
      quantityUnits: true,
    },
    orderBy: {
      _sum: {
        quantityUnits: 'desc',
      },
    },
    take: 5,
  });

  const productsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: {
          productBase: true,
        },
      });
      return {
        ...item,
        variant,
      };
    })
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Productos Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {productsWithDetails.length === 0 ? (
          <p className="text-base text-gray-500 py-4">No hay datos de ventas</p>
        ) : (
          <div className="space-y-4">
            {productsWithDetails.map((item, index) => (
              <div key={item.productVariantId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold">
                      {item.variant?.productBase.name} {item.variant?.gramWeightG}g
                    </p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.variant?.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold">{item._sum.quantityUnits} unidades</p>
                  <p className="text-sm text-gray-500">Últimos 30 días</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
