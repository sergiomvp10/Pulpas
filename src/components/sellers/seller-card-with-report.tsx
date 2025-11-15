'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SellerActions } from '@/components/sellers/seller-actions';
import { SellerMonthlySummary } from '@/components/sellers/seller-monthly-summary';
import { SellerReportModal } from '@/components/sellers/seller-report-modal';
import { FileText } from 'lucide-react';

interface Seller {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  commissionRate: number;
  notes?: string;
}

interface SellerCardWithReportProps {
  seller: Seller;
}

export function SellerCardWithReport({ seller }: SellerCardWithReportProps) {
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{seller.name}</CardTitle>
            </div>
            <SellerActions sellerId={seller.id} sellerName={seller.name} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {seller.phone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Teléfono:</span> {seller.phone}
              </p>
            )}
            {seller.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {seller.email}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Comisión:</span> {(seller.commissionRate * 100).toFixed(1)}%
            </p>
            {seller.notes && (
              <p className="text-sm text-gray-500 mt-2">{seller.notes}</p>
            )}

            <SellerMonthlySummary sellerId={seller.id} />

            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowReport(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Informe Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SellerReportModal
        sellerId={seller.id}
        sellerName={seller.name}
        open={showReport}
        onOpenChange={setShowReport}
      />
    </>
  );
}
