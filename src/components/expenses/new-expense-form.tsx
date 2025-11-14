'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/pricing';

const EXPENSE_CATEGORIES = [
  { value: 'INSUMOS', label: 'Insumos' },
  { value: 'RENTA', label: 'Renta/Arriendo' },
  { value: 'SERVICIOS', label: 'Servicios Públicos' },
  { value: 'EMPLEADOS', label: 'Empleados/Nómina' },
  { value: 'OTROS', label: 'Otros' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'BANCOLOMBIA', label: 'Bancolombia' },
];

export function NewExpenseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    paymentMethod: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.category || !formData.amount) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          category: formData.category,
          amountCents: Math.round(parseFloat(formData.amount) * 100),
          paymentMethod: formData.paymentMethod,
          expenseDate: formData.expenseDate,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el gasto');
      }

      router.push('/dashboard/expenses');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el gasto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Input
            id="description"
            placeholder="Ej: Pago de arriendo mes de noviembre"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monto (COP) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="50000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          {formData.amount && (
            <p className="text-sm text-gray-500">
              {formatCurrency(Math.round(parseFloat(formData.amount) * 100))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Fecha del Gasto *</Label>
          <Input
            id="expenseDate"
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Información adicional sobre el gasto..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Registrar Gasto'}
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
