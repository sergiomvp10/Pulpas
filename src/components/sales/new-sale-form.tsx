'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/pricing';

interface ProductVariant {
  id: string;
  sku: string;
  gramWeightG: number;
  pricePerUnit: number;
  manualPriceCents: number | null;
  productBase: {
    name: string;
    category: {
      defaultMargin: number;
      pricePerGram: number;
    };
  };
}

interface Customer {
  id: string;
  name: string;
}

interface Seller {
  id: string;
  name: string;
}

interface SaleLine {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

interface NewSaleFormProps {
  productVariants: ProductVariant[];
  customers: Customer[];
  sellers?: Seller[];
  userRole: string;
}

export function NewSaleForm({ productVariants, customers, sellers, userRole }: NewSaleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saleLines, setSaleLines] = useState<SaleLine[]>([]);
  const [currentLine, setCurrentLine] = useState({
    productVariantId: '',
    quantity: '',
    unitPrice: '',
  });

  const addLine = () => {
    if (!currentLine.productVariantId || !currentLine.quantity || !currentLine.unitPrice) {
      setError('Por favor completa todos los campos de la línea');
      return;
    }

    setSaleLines([
      ...saleLines,
      {
        productVariantId: currentLine.productVariantId,
        quantity: parseInt(currentLine.quantity),
        unitPrice: parseFloat(currentLine.unitPrice),
      },
    ]);

    setCurrentLine({ productVariantId: '', quantity: '', unitPrice: '' });
    setError('');
  };

  const removeLine = (index: number) => {
    setSaleLines(saleLines.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleLines.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId && customerId !== 'none' ? customerId : null,
          sellerId: sellerId || null,
          paymentMethod,
          lines: saleLines.map(line => ({
            productVariantId: line.productVariantId,
            quantity: line.quantity,
            unitPriceCents: Math.round(line.unitPrice * 100),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la venta');
      }

      router.push('/dashboard/sales');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la venta';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductName = (variantId: string) => {
    const variant = productVariants.find(v => v.id === variantId);
    return variant ? `${variant.productBase.name} ${variant.gramWeightG}g` : '';
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerId">Cliente (opcional)</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin cliente</SelectItem>
              {customers
                .filter((customer) => customer.id && customer.name)
                .map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {userRole === 'ADMIN' && sellers && sellers.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="sellerId">Vendedor (opcional)</Label>
            <Select value={sellerId} onValueChange={setSellerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller: any) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Efectivo</SelectItem>
              <SelectItem value="NEQUI">Nequi</SelectItem>
              <SelectItem value="BANCOLOMBIA">Bancolombia</SelectItem>
              <SelectItem value="CREDIT">Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Productos</h3>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Producto</Label>
                <Select
                  value={currentLine.productVariantId}
                  onValueChange={(value) => {
                    const selectedVariant = productVariants.find(v => v.id === value);
                    if (selectedVariant) {
                      let price = 0;
                      
                      if (selectedVariant.manualPriceCents && selectedVariant.manualPriceCents > 0) {
                        price = selectedVariant.manualPriceCents / 100;
                      }
                      else if (Number(selectedVariant.pricePerUnit) > 0) {
                        price = Number(selectedVariant.pricePerUnit);
                      }
                      else {
                        const pricePerGram = selectedVariant.productBase.category.pricePerGram;
                        const gramWeight = selectedVariant.gramWeightG;
                        price = gramWeight * pricePerGram;
                      }
                      
                      setCurrentLine({ 
                        ...currentLine, 
                        productVariantId: value,
                        unitPrice: price.toString(),
                      });
                    } else {
                      setCurrentLine({ 
                        ...currentLine, 
                        productVariantId: value,
                        unitPrice: '',
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.productBase.name} {variant.gramWeightG}g
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={currentLine.quantity}
                  onChange={(e) => setCurrentLine({ ...currentLine, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Precio Unit. (COP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="3400"
                  value={currentLine.unitPrice}
                  onChange={(e) => setCurrentLine({ ...currentLine, unitPrice: e.target.value })}
                />
              </div>
            </div>

            <Button type="button" onClick={addLine} className="mt-4" variant="outline">
              Agregar Producto
            </Button>
          </CardContent>
        </Card>

        {saleLines.length > 0 && (
          <div className="space-y-2">
            {saleLines.map((line, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{getProductName(line.productVariantId)}</p>
                  <p className="text-sm text-gray-500">
                    {line.quantity} × {formatCurrency(Math.round(line.unitPrice * 100))} = {formatCurrency(Math.round(line.quantity * line.unitPrice * 100))}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeLine(index)}
                >
                  Eliminar
                </Button>
              </div>
            ))}

            <div className="flex justify-end border-t pt-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(calculateTotal() * 100))}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || saleLines.length === 0}>
          {isLoading ? 'Procesando...' : 'Registrar Venta'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
