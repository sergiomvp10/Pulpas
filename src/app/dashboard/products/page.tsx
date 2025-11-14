import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductActions } from '@/components/products/product-actions';

export const metadata = {
  title: 'Productos | Sistema de Gestión de Pulpas',
};

async function ProductsList() {
  noStore(); // Prevent caching to always show latest products
  
  const products = await prisma.productBase.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: {
        where: { active: true },
        orderBy: { gramWeightG: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  const productsByCategory = products.reduce((acc, product) => {
    const categoryName = product.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const sortedCategories = Object.keys(productsByCategory).sort((a, b) => {
    if (a.includes('Tradicional')) return -1;
    if (b.includes('Tradicional')) return 1;
    if (a.includes('Exótico')) return -1;
    if (b.includes('Exótico')) return 1;
    return a.localeCompare(b, 'es');
  });

  return (
    <div className="space-y-8">
      {sortedCategories.map((categoryName) => {
        const categoryProducts = productsByCategory[categoryName].sort((a, b) => 
          a.name.localeCompare(b.name, 'es')
        );
        
        return (
          <div key={categoryName} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{categoryName.toUpperCase()}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryProducts.map((product: any) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <ProductActions productId={product.id} productName={product.name} />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      
      {sortedCategories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay productos registrados. Haz clic en "Añadir Producto" para crear uno.
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-gray-500">Gestión de productos y presentaciones</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button size="lg">
            Añadir Producto
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
