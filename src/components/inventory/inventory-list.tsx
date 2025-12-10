'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/pricing';
import { formatDateShortColombia, nowColombia } from '@/lib/date-utils';

interface Lot {
  id: string;
  code: string;
  productionDate: string;
  expiryDate: string;
  unitsInitial: number;
  unitsOnHand: number;
  costPerUnitCents: number;
  status: string;
  notes: string | null;
  productVariant: {
    id: string;
    gramWeightG: number;
    productBase: {
      id: string;
      name: string;
    };
  };
  location: {
    id: string;
    name: string;
  } | null;
}

interface AggregatedInventory {
  productVariantId: string;
  productName: string;
  gramWeightG: number;
  totalUnits: number;
  earliestExpiry: string;
  totalValue: number;
  lotCount: number;
}

export function InventoryList() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLots = async () => {
    try {
      const response = await fetch('/api/lots/list');
      if (response.ok) {
        const data = await response.json();
        setLots(data);
      }
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Aggregate lots by product variant
  const aggregatedInventory = useMemo(() => {
    const grouped = new Map<string, AggregatedInventory>();

    for (const lot of lots) {
      const key = lot.productVariant.id;
      const existing = grouped.get(key);

      if (existing) {
        existing.totalUnits += lot.unitsOnHand;
        existing.totalValue += lot.unitsOnHand * lot.costPerUnitCents;
        existing.lotCount += 1;
        // Keep the earliest expiry date
        if (new Date(lot.expiryDate) < new Date(existing.earliestExpiry)) {
          existing.earliestExpiry = lot.expiryDate;
        }
      } else {
        grouped.set(key, {
          productVariantId: lot.productVariant.id,
          productName: lot.productVariant.productBase.name,
          gramWeightG: lot.productVariant.gramWeightG,
          totalUnits: lot.unitsOnHand,
          earliestExpiry: lot.expiryDate,
          totalValue: lot.unitsOnHand * lot.costPerUnitCents,
          lotCount: 1,
        });
      }
    }

    // Sort by product name, then by gram weight
    return Array.from(grouped.values()).sort((a, b) => {
      const nameCompare = a.productName.localeCompare(b.productName);
      if (nameCompare !== 0) return nameCompare;
      return a.gramWeightG - b.gramWeightG;
    });
  }, [lots]);

  if (isLoading) {
    return <div>Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-gray-500">Stock disponible por producto</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/new">Añadir Producción</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {aggregatedInventory.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No hay productos en inventario</p>
            </CardContent>
          </Card>
        ) : (
          aggregatedInventory.map((item) => {
            const daysUntilExpiry = differenceInDays(new Date(item.earliestExpiry), nowColombia());
            const isExpiringSoon = daysUntilExpiry <= 30;
            const isExpired = daysUntilExpiry < 0;
            const avgCost = item.totalUnits > 0 ? Math.round(item.totalValue / item.totalUnits) : 0;

            return (
              <Card key={item.productVariantId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {item.productName} {item.gramWeightG}g
                    </CardTitle>
                    {item.totalUnits > 0 && (
                      <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'outline'}>
                        {isExpired ? 'Vencido' : `Vence en ${daysUntilExpiry} días`}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Unidades Disponibles</p>
                      <p className="text-2xl font-bold">{item.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Costo Promedio</p>
                      <p className="text-lg font-bold">{formatCurrency(avgCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Próximo Vencimiento</p>
                      <p className="text-sm">{item.totalUnits > 0 ? formatDateShortColombia(item.earliestExpiry) : '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
