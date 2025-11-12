import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <CardTitle>Formulario de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para registrar nuevos clientes con sus datos de contacto e historial.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
