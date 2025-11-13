import { Suspense } from 'react';
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant="outline" className="mt-2">
                  {product.category.name}
                </Badge>
              </div>
              <ProductActions productId={product.id} productName={product.name} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Margen: {(product.category.defaultMargin * 100).toFixed(0)}%
              </p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Presentaciones:</p>
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between text-sm">
                    <span>{variant.gramWeightG}g</span>
                    <span className="text-xs text-gray-500">{variant.sku}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
