import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Vendedores | Sistema de Gestión de Pulpas',
  description: 'Gestión de vendedores',
};

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
        <p className="text-gray-500">
          Gestión de vendedores y comisiones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para gestionar vendedores, asignar zonas y calcular comisiones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
