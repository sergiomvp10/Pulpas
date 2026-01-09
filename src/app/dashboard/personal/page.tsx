import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EmployeeCard } from '@/components/personal/employee-card';

export const metadata = {
  title: 'Personal | FrutyLab',
  description: 'Gestión de empleados de planta',
};

async function EmployeesList() {
  const employees = await prisma.employee.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          notes: true,
          payments: true,
        },
      },
    },
  });

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            No hay empleados registrados. Haz clic en &quot;Añadir Empleado&quot; para crear uno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}

export default function PersonalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal</h1>
          <p className="text-gray-500">
            Gestión de empleados de planta
          </p>
        </div>
        <Link href="/dashboard/personal/new">
          <Button size="lg">
            Añadir Empleado
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando empleados...</div>}>
        <EmployeesList />
      </Suspense>
    </div>
  );
}
