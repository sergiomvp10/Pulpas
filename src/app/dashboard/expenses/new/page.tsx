import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewExpenseForm } from '@/components/expenses/new-expense-form';

export const metadata = {
  title: 'Nuevo Gasto | FrutyLab',
};

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h1>
        <p className="text-gray-500">Registrar un nuevo gasto de la empresa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <NewExpenseForm />
        </CardContent>
      </Card>
    </div>
  );
}
