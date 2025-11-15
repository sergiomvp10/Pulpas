'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SellerMonthlySummaryProps {
  sellerId: string;
}

interface SummaryData {
  salesCount: number;
  totalCents: number;
  commissionCents: number;
  averageTicketCents: number;
  salesChange: number;
  revenueChange: number;
}

export function SellerMonthlySummary({ sellerId }: SellerMonthlySummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/sellers/${sellerId}/report?days=30`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        setData({
          salesCount: result.metrics.salesCount,
          totalCents: result.metrics.totalCents,
          commissionCents: result.metrics.commissionCents,
          averageTicketCents: result.metrics.averageTicketCents,
          salesChange: result.comparison.salesChange,
          revenueChange: result.comparison.revenueChange,
        });
      } catch (err) {
        console.error('Error fetching seller summary:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [sellerId]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatChange = (change: number) => {
    if (change === 0) return null;
    const arrow = change > 0 ? '↑' : '↓';
    const color = change > 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`text-xs ${color} ml-1`}>
        {arrow} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t space-y-2">
        <p className="text-xs font-medium text-gray-500 mb-2">Últimos 30 días</p>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (data.salesCount === 0) {
    return (
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs font-medium text-gray-500 mb-2">Últimos 30 días</p>
        <p className="text-sm text-gray-400">Sin ventas en este período</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t space-y-2">
      <p className="text-xs font-medium text-gray-500 mb-2">Últimos 30 días</p>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Ventas:</span>
        <span className="text-sm font-medium">
          {data.salesCount}
          {formatChange(data.salesChange)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Ingresos:</span>
        <span className="text-sm font-medium">
          {formatCurrency(data.totalCents)}
          {formatChange(data.revenueChange)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Comisión:</span>
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(data.commissionCents)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Ticket promedio:</span>
        <span className="text-sm font-medium">
          {formatCurrency(data.averageTicketCents)}
        </span>
      </div>
    </div>
  );
}
