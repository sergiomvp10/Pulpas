'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface SellerReportModalProps {
  sellerId: string;
  sellerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportData {
  seller: {
    name: string;
    commissionRate: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  metrics: {
    salesCount: number;
    totalCents: number;
    commissionCents: number;
    averageTicketCents: number;
    unitsSold: number;
    activeDays: number;
  };
  comparison: {
    salesChange: number;
    revenueChange: number;
    commissionChange: number;
    prevSalesCount: number;
    prevTotalCents: number;
  };
  topProducts: Array<{
    name: string;
    weight: number;
    units: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: string;
    saleNumber: string;
    occurredAt: string;
    totalAmountCents: number;
    itemCount: number;
  }>;
}

export function SellerReportModal({
  sellerId,
  sellerName,
  open,
  onOpenChange,
}: SellerReportModalProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !data) {
      fetchReport();
    }
  }, [open, sellerId]);

  async function fetchReport() {
    if (!sellerId) {
      setError('Falta ID de vendedor');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sellers/${sellerId}/report?days=30&sellerId=${sellerId}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching seller report:', errorData);
        throw new Error(errorData.message || 'Failed to fetch report');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching seller report:', err);
      setError('Error al cargar el informe');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChange = (change: number) => {
    if (change === 0) return <span className="text-gray-500">Sin cambio</span>;
    const arrow = change > 0 ? '↑' : '↓';
    const color = change > 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {arrow} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informe de Ventas - {sellerName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchReport} className="mt-4">
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6 py-4">
            {/* Period Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Período: Últimos {data.period.days} días
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
              </p>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ventas</p>
                <p className="text-2xl font-bold">{data.metrics.salesCount}</p>
                <p className="text-xs mt-1">{formatChange(data.comparison.salesChange)}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ingresos</p>
                <p className="text-xl font-bold">{formatCurrency(data.metrics.totalCents)}</p>
                <p className="text-xs mt-1">{formatChange(data.comparison.revenueChange)}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Comisión</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.metrics.commissionCents)}
                </p>
                <p className="text-xs mt-1">{formatChange(data.comparison.commissionChange)}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                <p className="text-xl font-bold">
                  {formatCurrency(data.metrics.averageTicketCents)}
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-600">Unidades Vendidas</p>
                <p className="text-2xl font-bold mt-1">{data.metrics.unitsSold}</p>
              </div>

              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-600">Días Activos</p>
                <p className="text-2xl font-bold mt-1">
                  {data.metrics.activeDays} / {data.period.days}
                </p>
              </div>
            </div>

            {/* Top Products */}
            {data.topProducts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Productos Más Vendidos</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Unidades
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Ingresos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.topProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {product.name} ({product.weight}g)
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {product.units}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Sales */}
            {data.recentSales.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Últimas Ventas</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          N° Venta
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Fecha
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                          Items
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.recentSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {sale.saleNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(sale.occurredAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {sale.itemCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(sale.totalAmountCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Comparison with Previous Period */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Comparación con Período Anterior</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ventas</p>
                  <p className="font-medium">
                    {data.comparison.prevSalesCount} → {data.metrics.salesCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ingresos</p>
                  <p className="font-medium">
                    {formatCurrency(data.comparison.prevTotalCents)} → {formatCurrency(data.metrics.totalCents)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tasa de Comisión</p>
                  <p className="font-medium">
                    {(data.seller.commissionRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
