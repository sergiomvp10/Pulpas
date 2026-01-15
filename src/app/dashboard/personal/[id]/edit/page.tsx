import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeForm } from '@/components/personal/employee-form';

export const metadata = {
  title: 'Editar Empleado | FrutyLab',
  description: 'Editar información del empleado',
};

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Empleado</h1>
        <p className="text-gray-500">
          Actualiza la información del empleado
        </p>
      </div>

      <EmployeeForm employee={employee} />
    </div>
  );
}
