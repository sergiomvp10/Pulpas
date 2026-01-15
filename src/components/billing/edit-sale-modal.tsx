'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';

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

interface EditableLine {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

interface EditSaleModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function EditSaleModal({ sale, isOpen, onClose, onSaved }: EditSaleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [editableLines, setEditableLines] = useState<EditableLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [currentLine, setCurrentLine] = useState({
    productVariantId: '',
    quantity: '',
    unitPrice: '',
  });

  useEffect(() => {
    if (isOpen && sale) {
      setEditableLines(
        sale.saleLines.map((line) => ({
          productVariantId: line.productVariant.id,
          quantity: line.quantityUnits,
          unitPrice: line.unitPriceCents / 100,
        }))
      );
      setPaymentMethod(sale.paymentMethod);
      setError(null);
      fetchProductVariants();
    }
  }, [isOpen, sale]);

  const fetchProductVariants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products/variants');
      if (response.ok) {
        const data = await response.json();
        setProductVariants(data);
      }
    } catch (err) {
      console.error('Error fetching product variants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addLine = () => {
    if (!currentLine.productVariantId || !currentLine.quantity || !currentLine.unitPrice) {
      setError('Por favor completa todos los campos de la línea');
      return;
    }

    setEditableLines([
      ...editableLines,
      {
        productVariantId: currentLine.productVariantId,
        quantity: parseInt(currentLine.quantity),
        unitPrice: parseFloat(currentLine.unitPrice),
      },
    ]);

    setCurrentLine({ productVariantId: '', quantity: '', unitPrice: '' });
    setError(null);
  };

  const removeLine = (index: number) => {
    setEditableLines(editableLines.filter((_, i) => i !== index));
  };

  const updateLineQuantity = (index: number, quantity: string) => {
    const newLines = [...editableLines];
    newLines[index].quantity = parseInt(quantity) || 0;
    setEditableLines(newLines);
  };

  const updateLinePrice = (index: number, price: string) => {
    const newLines = [...editableLines];
    newLines[index].unitPrice = parseFloat(price) || 0;
    setEditableLines(newLines);
  };

  const calculateTotal = () => {
    return editableLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  };

  const getProductName = (variantId: string) => {
    const variant = productVariants.find((v) => v.id === variantId);
    if (variant) {
      return `${variant.productBase.name} ${variant.gramWeightG}g`;
    }
    const saleLine = sale?.saleLines.find((l) => l.productVariant.id === variantId);
    if (saleLine) {
      return `${saleLine.productVariant.productBase.name} ${saleLine.productVariant.gramWeightG}g`;
    }
    return 'Producto desconocido';
  };

  const handleSave = async () => {
    if (editableLines.length === 0) {
      setError('Debe incluir al menos un producto');
      return;
    }

    if (!sale) return;

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          lines: editableLines.map((line) => ({
            productVariantId: line.productVariantId,
            quantity: line.quantity,
            unitPriceCents: Math.round(line.unitPrice * 100),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar la venta');
      }

      onSaved();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la venta';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Factura {sale.saleNumber}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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

          <div className="space-y-2">
            <Label className="text-base font-medium">Productos</Label>
            
            {editableLines.map((line, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{getProductName(line.productVariantId)}</p>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLineQuantity(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.unitPrice}
                    onChange={(e) => updateLinePrice(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="w-24 text-right text-sm font-medium">
                  {formatCurrency(Math.round(line.quantity * line.unitPrice * 100))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Card className="mt-4">
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-3">Agregar Producto</p>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <Select
                        value={currentLine.productVariantId}
                        onValueChange={(value) => {
                          const selectedVariant = productVariants.find((v) => v.id === value);
                          if (selectedVariant) {
                            let price = 0;
                            if (selectedVariant.manualPriceCents && selectedVariant.manualPriceCents > 0) {
                              price = selectedVariant.manualPriceCents / 100;
                            } else if (Number(selectedVariant.pricePerUnit) > 0) {
                              price = Number(selectedVariant.pricePerUnit);
                            } else {
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
                        <SelectTrigger className="h-9">
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
                    <div>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={currentLine.quantity}
                        onChange={(e) => setCurrentLine({ ...currentLine, quantity: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio"
                        value={currentLine.unitPrice}
                        onChange={(e) => setCurrentLine({ ...currentLine, unitPrice: e.target.value })}
                        className="h-9"
                      />
                      <Button type="button" onClick={addLine} size="sm" className="h-9 px-3">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(Math.round(calculateTotal() * 100))}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || editableLines.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
