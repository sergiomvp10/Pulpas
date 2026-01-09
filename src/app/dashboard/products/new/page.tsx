import { prisma } from '@/lib/db';
import { NewProductForm } from '@/components/products/new-product-form';

export const metadata = {
  title: 'Nuevo Producto | FrutyLab',
  description: 'Crear nuevo producto',
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      pricePerGram: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
        <p className="text-gray-500">
          Crear un nuevo producto base con sus presentaciones
        </p>
      </div>

      <NewProductForm categories={categories} />
    </div>
  );
}
