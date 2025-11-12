import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Clientes | Sistema de Gestión de Pulpas',
  description: 'Gestión de clientes',
};

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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para gestionar clientes, historial de compras y datos de contacto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
