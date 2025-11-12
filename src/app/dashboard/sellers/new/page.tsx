import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Nuevo Vendedor | Sistema de Gestión de Pulpas',
  description: 'Crear nuevo vendedor',
};

export default function NewSellerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Vendedor</h1>
        <p className="text-gray-500">
          Registrar un nuevo vendedor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para registrar nuevos vendedores con sus datos de contacto, zonas asignadas y comisiones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
