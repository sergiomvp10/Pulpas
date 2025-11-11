'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductVariant {
  id: string;
  sku: string;
  gramWeightG: number;
  productBase: {
    name: string;
  };
}

interface Location {
  id: string;
  name: string;
}

interface NewLotFormProps {
  productVariants: ProductVariant[];
  locations: Location[];
}

export function NewLotForm({ productVariants, locations }: NewLotFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productVariantId: '',
    productionDate: new Date().toISOString().split('T')[0],
    unitsInitial: '',
    costPerUnit: '',
    locationId: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitsInitial: parseInt(formData.unitsInitial),
          costPerUnitCents: Math.round(parseFloat(formData.costPerUnit) * 100),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el lote');
      }

      router.push('/dashboard/inventory');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el lote';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="productVariantId">Producto *</Label>
        <Select
          value={formData.productVariantId}
          onValueChange={(value) => setFormData({ ...formData, productVariantId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {productVariants.map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                {variant.productBase.name} {variant.gramWeightG}g ({variant.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="productionDate">Fecha de Producción *</Label>
          <Input
            id="productionDate"
            type="date"
            value={formData.productionDate}
            onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitsInitial">Unidades Producidas *</Label>
          <Input
            id="unitsInitial"
            type="number"
            min="1"
            placeholder="100"
            value={formData.unitsInitial}
            onChange={(e) => setFormData({ ...formData, unitsInitial: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="costPerUnit">Costo Unitario (COP) *</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            min="0"
            placeholder="2000"
            value={formData.costPerUnit}
            onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationId">Ubicación</Label>
          <Select
            value={formData.locationId}
            onValueChange={(value) => setFormData({ ...formData, locationId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          placeholder="Notas adicionales sobre el lote"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Lote'}
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
