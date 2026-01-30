import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CustomerActions } from '@/components/customers/customer-actions';
import { auth } from '@/auth';

export const metadata = {
  title: 'Clientes | FrutyLab',
  description: 'Gestión de clientes',
};

async function CustomersList() {
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';

  const whereClause: { active: boolean; createdBySellerId?: string } = { active: true };

  if (isSeller && user?.id) {
    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
    });
    if (seller) {
      whereClause.createdBySellerId = seller.id;
    }
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
    include: {
      createdBySeller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            No hay clientes registrados. Haz clic en &quot;Añadir Cliente&quot; para crear uno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer: any) => (
        <Card key={customer.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                {isAdmin && customer.createdBySeller && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Vendedor: {customer.createdBySeller.name}
                  </Badge>
                )}
              </div>
              {isAdmin && (
                <CustomerActions customerId={customer.id} customerName={customer.name} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Teléfono:</span> {customer.phone}
              </p>
              {customer.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Dirección:</span> {customer.email}
                </p>
              )}
              {customer.city && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ciudad:</span> {customer.city}
                </p>
              )}
              {customer.notes && (
                <p className="text-sm text-gray-500 mt-2">{customer.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-gray-500">
            Gestión de clientes y contactos
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button size="lg">
            Añadir Cliente
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando clientes...</div>}>
        <CustomersList />
      </Suspense>
    </div>
  );
}
