'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  pricePerGram: number;
}

interface NewProductFormProps {
  categories: Category[];
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
  });

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const weights = [125, 250, 500, 1000];
  const pricePerGram = selectedCategory?.pricePerGram || 0;

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>
            Ingresa el nombre y selecciona la categoría. Las presentaciones se crearán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              placeholder="Ej: Mango, Maracuyá, Frutos Rojos..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.pricePerGram} pesos/gramo)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Presentaciones que se crearán</CardTitle>
            <CardDescription>
              Se crearán automáticamente 4 presentaciones con precios calculados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weights.map((weight) => {
                const price = weight * pricePerGram;
                return (
                  <div key={weight} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{weight}g</p>
                      <p className="text-sm text-gray-500">
                        SKU: {formData.name.toUpperCase().replace(/\s+/g, '-')}-{weight}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${price.toLocaleString('es-CO')}</p>
                      <p className="text-xs text-gray-500">
                        {weight}g × ${pricePerGram}/g
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Creando...' : 'Crear Producto'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/products')}
          size="lg"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
