import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditCustomerForm } from '@/components/customers/edit-customer-form';

export const metadata = {
  title: 'Editar Cliente | Sistema de Gestión de Pulpas',
};

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
        <p className="text-gray-500">
          Modificar información del cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
