import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewSaleForm } from '@/components/sales/new-sale-form';
import { auth } from '@/auth';

export const metadata = {
  title: 'Nueva Venta | FrutyLab',
};

export const dynamic = 'force-dynamic';

export default async function NewSalePage() {
  const session = await auth();
  const userRole = session?.user?.role || 'ADMIN';

  const [productVariants, customers, sellers] = await Promise.all([
    prisma.productVariant.findMany({
      where: { 
        active: true,
        productBase: {
          is: {
            active: true,
          },
        },
      },
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
                pricePerGram: true,
              },
            },
          },
        },
      },
    }),
    prisma.customer.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    userRole === 'ADMIN' 
      ? prisma.seller.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
          },
        })
      : Promise.resolve([]),
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
          <NewSaleForm 
            productVariants={productVariants} 
            customers={customers} 
            sellers={sellers}
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
