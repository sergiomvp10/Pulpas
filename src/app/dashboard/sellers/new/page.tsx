import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewSellerForm } from '@/components/sellers/new-seller-form';

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
          <CardTitle>Información del Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <NewSellerForm />
        </CardContent>
      </Card>
    </div>
  );
}
