import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Facturación | FrutyLab',
  description: 'Gestión de facturación',
};

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <p className="text-gray-500">
          Gestión de facturas y documentos tributarios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Esta sección estará disponible próximamente para generar facturas, notas de crédito y gestionar documentos tributarios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
