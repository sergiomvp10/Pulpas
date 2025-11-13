import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProductForm } from '@/components/products/edit-product-form';

export const metadata = {
  title: 'Editar Producto | Sistema de Gestión de Pulpas',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.productBase.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        where: { active: true },
        orderBy: { gramWeightG: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
        <p className="text-gray-500">
          Modificar información del producto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
