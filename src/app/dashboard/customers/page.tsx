import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CustomerActions } from '@/components/customers/customer-actions';

export const metadata = {
  title: 'Clientes | Sistema de Gestión de Pulpas',
  description: 'Gestión de clientes',
};

async function CustomersList() {
  const customers = await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
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
              </div>
              <CustomerActions customerId={customer.id} customerName={customer.name} />
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
