import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditSellerForm } from '@/components/sellers/edit-seller-form';

export const metadata = {
  title: 'Editar Vendedor | Sistema de Gestión de Pulpas',
};

export default async function EditSellerPage({ params }: { params: { id: string } }) {
  const seller = await prisma.seller.findUnique({
    where: { id: params.id },
  });

  if (!seller) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Vendedor</h1>
        <p className="text-gray-500">
          Modificar información del vendedor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <EditSellerForm seller={seller} />
        </CardContent>
      </Card>
    </div>
  );
}
