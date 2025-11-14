import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExpensesList } from '@/components/expenses/expenses-list';

export const metadata = {
  title: 'Gastos | Sistema de Gestión de Pulpas',
};

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-gray-500">Registro y gestión de gastos de la empresa</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/new">Registrar Gasto</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando gastos...</div>}>
        <ExpensesList />
      </Suspense>
    </div>
  );
}
