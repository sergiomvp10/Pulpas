import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewLotForm } from '@/components/inventory/new-lot-form';

export const metadata = {
  title: 'Nueva Producción | Sistema de Gestión de Pulpas',
};

export default async function NewLotPage() {
  const [productVariants, locations] = await Promise.all([
    prisma.productVariant.findMany({
      where: { active: true },
      include: {
        productBase: true,
      },
      orderBy: [
        { productBase: { name: 'asc' } },
        { gramWeightG: 'asc' },
      ],
    }),
    prisma.inventoryLocation.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Producción</h1>
        <p className="text-gray-500">Registrar un nuevo lote de producción</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <NewLotForm productVariants={productVariants} locations={locations} />
        </CardContent>
      </Card>
    </div>
  );
}
