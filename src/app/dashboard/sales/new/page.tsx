import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewSaleForm } from '@/components/sales/new-sale-form';

export const metadata = {
  title: 'Nueva Venta | Sistema de Gestión de Pulpas',
};

export default async function NewSalePage() {
  const [productVariants, customers] = await Promise.all([
    prisma.productVariant.findMany({
      where: { active: true },
      orderBy: [
        { productBase: { name: 'asc' } },
        { gramWeightG: 'asc' },
      ],
      select: {
        id: true,
        sku: true,
        gramWeightG: true,
        pricePerUnit: true,
        manualPriceCents: true,
        productBase: {
          select: {
            name: true,
            category: {
              select: {
                defaultMargin: true,
              },
            },
          },
        },
      },
    }),
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
        <p className="text-gray-500">Registrar una nueva venta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <NewSaleForm productVariants={productVariants} customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
