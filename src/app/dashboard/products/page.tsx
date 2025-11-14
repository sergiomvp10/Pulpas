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

  const tradicionales = products
    .filter(p => p.category.name === 'Tradicional')
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  
  const exoticos = products
    .filter(p => p.category.name === 'Exóticos')
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return (
    <div className="space-y-8">
      {/* Tradicional Section */}
      {tradicionales.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">TRADICIONAL</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tradicionales.map((product: any) => (
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
      )}

      {/* Exóticos Section */}
      {exoticos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">EXÓTICOS</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exoticos.map((product: any) => (
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
