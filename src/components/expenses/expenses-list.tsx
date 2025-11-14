'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/pricing';
import { formatDateTimeColombia } from '@/lib/date-utils';
import { Pencil, Trash2 } from 'lucide-react';

interface Expense {
  id: string;
  expenseNumber: string;
  description: string;
  category: string;
  amountCents: number;
  paymentMethod: string;
  expenseDate: string;
  notes: string | null;
  createdBy: {
    id: string;
    name: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  INSUMOS: 'Insumos',
  RENTA: 'Renta/Arriendo',
  SERVICIOS: 'Servicios Públicos',
  EMPLEADOS: 'Empleados/Nómina',
  OTROS: 'Otros',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  NEQUI: 'Nequi',
  BANCOLOMBIA: 'Bancolombia',
};

export function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') {
        params.append('category', categoryFilter);
      }

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  if (isLoading) {
    return <div>Cargando gastos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumen de Gastos</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las categorías</SelectItem>
                  <SelectItem value="INSUMOS">Insumos</SelectItem>
                  <SelectItem value="RENTA">Renta/Arriendo</SelectItem>
                  <SelectItem value="SERVICIOS">Servicios Públicos</SelectItem>
                  <SelectItem value="EMPLEADOS">Empleados/Nómina</SelectItem>
                  <SelectItem value="OTROS">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Total de Gastos</p>
            <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-sm text-gray-500 mt-1">{expenses.length} gasto(s) registrado(s)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay gastos registrados</p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{expense.description}</p>
                      <Badge variant="outline">{CATEGORY_LABELS[expense.category]}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTimeColombia(new Date(expense.expenseDate))} • {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                    </p>
                    {expense.notes && (
                      <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Registrado por: {expense.createdBy.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(expense.amountCents)}</p>
                      <p className="text-xs text-gray-500">{expense.expenseNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
