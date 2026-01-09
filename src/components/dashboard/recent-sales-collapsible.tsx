'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import { formatDateTimeColombia } from '@/lib/date-utils';

interface Sale {
  id: string;
  occurredAt: Date;
  totalAmountCents: number;
  paymentMethod: string;
  customer: {
    name: string;
  } | null;
  seller: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    role: string;
  } | null;
  saleLines: Array<{
    quantityUnits: number;
    productVariant: {
      gramWeightG: number;
      productBase: {
        name: string;
      };
    };
  }>;
}

interface RecentSalesCollapsibleProps {
  mostRecentSale?: Sale;
  allSales: Sale[];
}

export function RecentSalesCollapsible({ mostRecentSale, allSales }: RecentSalesCollapsibleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderSale = (sale: Sale) => (
    <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="space-y-1">
        <p className="text-base font-semibold">
          {sale.customer?.name || 'Cliente sin nombre'}
        </p>
        <p className="text-sm text-gray-500">
          {sale.saleLines.map((line) => 
            `${line.productVariant.productBase.name} ${line.productVariant.gramWeightG}g (${line.quantityUnits})`
          ).join(', ')}
        </p>
        <p className="text-sm text-gray-500">
          {formatDateTimeColombia(sale.occurredAt)}
        </p>
        {sale.seller ? (
          <p className="text-xs text-blue-600 font-medium mt-1">
            Vendedor: {sale.seller.name}
          </p>
        ) : sale.createdBy ? (
          <p className="text-xs text-gray-500 mt-1">
            {sale.createdBy.role === 'ADMIN' ? 'Registrada por Admin' : `Registrada por ${sale.createdBy.name}`}
          </p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="text-xl font-bold">
          {formatCurrency(sale.totalAmountCents)}
        </p>
        <Badge variant="outline" className="mt-1 text-sm">
          {sale.paymentMethod}
        </Badge>
      </div>
    </div>
  );

  if (allSales.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-base text-gray-500 py-4">No hay ventas registradas en las últimas 36 horas</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-0 right-0 z-10"
      >
        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
      <div className="mt-4">
        {isCollapsed ? (
          mostRecentSale && (
            <div className="space-y-5">
              {renderSale(mostRecentSale)}
            </div>
          )
        ) : (
          <div className="space-y-5">
            {allSales.map((sale: any) => renderSale(sale))}
          </div>
        )}
      </div>
    </div>
  );
}
