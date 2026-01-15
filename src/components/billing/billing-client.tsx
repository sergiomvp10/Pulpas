'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './invoice-pdf';
import { EditSaleModal } from './edit-sale-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SaleLine {
  id: string;
  quantityUnits: number;
  unitPriceCents: number;
  subtotalCents: number;
  productVariant: {
    id: string;
    gramWeightG: number;
    sku: string;
    productBase: {
      name: string;
      category: {
        name: string;
      };
    };
  };
}

interface Sale {
  id: string;
  saleNumber: string;
  occurredAt: string;
  paymentMethod: string;
  totalAmountCents: number;
  currency: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    city?: string;
  } | null;
  seller: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  createdBy: {
    name: string;
  };
  saleLines: SaleLine[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    CASH: 'Efectivo',
    NEQUI: 'Nequi',
    BANCOLOMBIA: 'Bancolombia',
    CREDIT: 'Crédito',
  };
  return methods[method] || method;
}

function getPaymentMethodColor(method: string): string {
  const colors: Record<string, string> = {
    CASH: 'bg-green-100 text-green-800',
    NEQUI: 'bg-purple-100 text-purple-800',
    BANCOLOMBIA: 'bg-yellow-100 text-yellow-800',
    CREDIT: 'bg-red-100 text-red-800',
  };
  return colors[method] || 'bg-gray-100 text-gray-800';
}

export function BillingClient() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales/recent');
      if (!response.ok) {
        throw new Error('Error al cargar las ventas');
      }
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (sale: Sale) => {
    try {
      setIsDownloading(true);
      const blob = await pdf(<InvoicePDF sale={sale} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura-${sale.saleNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/sales/${selectedSale.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la venta');
      }

      setIsDeleteDialogOpen(false);
      setSelectedSale(null);
      fetchSales();
    } catch (err) {
      console.error('Error deleting sale:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar la venta');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaleUpdated = () => {
    fetchSales();
    setSelectedSale(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Cargando ventas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchSales} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ventas del Último Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay ventas registradas
            </p>
          ) : (
            <div className="space-y-2">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedSale?.id === sale.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSale(sale)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{sale.saleNumber}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(sale.occurredAt)}
                      </div>
                      {sale.customer && (
                        <div className="text-sm text-gray-600 mt-1">
                          {sale.customer.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(sale.totalAmountCents)}
                      </div>
                      <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa de Factura
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedSale ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona una venta para ver la factura</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-green-600">
                    {selectedSale.saleNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedSale.occurredAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleDownloadPDF(selectedSale)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {selectedSale.customer && (
                <div>
                  <h4 className="font-medium mb-2">Cliente</h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedSale.customer.name}</p>
                    <p className="text-gray-500">{selectedSale.customer.phone}</p>
                    {selectedSale.customer.email && (
                      <p className="text-gray-500">{selectedSale.customer.email}</p>
                    )}
                    {selectedSale.customer.city && (
                      <p className="text-gray-500">{selectedSale.customer.city}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.saleLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {line.productVariant.productBase.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {line.productVariant.gramWeightG}g - {line.productVariant.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {line.quantityUnits}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(line.unitPriceCents)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(line.subtotalCents)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <Badge className={getPaymentMethodColor(selectedSale.paymentMethod)}>
                    {getPaymentMethodLabel(selectedSale.paymentMethod)}
                  </Badge>
                  {selectedSale.seller && (
                    <p className="text-sm text-gray-500 mt-2">
                      Vendedor: {selectedSale.seller.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedSale.totalAmountCents)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditSaleModal
        sale={selectedSale}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleSaleUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Factura</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la factura {selectedSale?.saleNumber}?
              Esta acción devolverá los productos al inventario y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSale}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
