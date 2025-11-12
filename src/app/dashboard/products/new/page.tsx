import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Nuevo Producto | Sistema de Gestión de Pulpas',
  description: 'Crear nuevo producto',
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
        <p className="text-gray-500">
          Crear un nuevo producto base con sus presentaciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para crear nuevos productos, definir categorías, márgenes y presentaciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
