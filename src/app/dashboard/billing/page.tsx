import { BillingClient } from '@/components/billing/billing-client';

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
          Selecciona una venta para generar y descargar la factura
        </p>
      </div>

      <BillingClient />
    </div>
  );
}
