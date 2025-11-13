import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewCustomerForm } from '@/components/customers/new-customer-form';

export const metadata = {
  title: 'Nuevo Cliente | Sistema de Gestión de Pulpas',
  description: 'Crear nuevo cliente',
};

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
        <p className="text-gray-500">
          Registrar un nuevo cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
