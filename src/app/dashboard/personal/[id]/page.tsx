import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeDetail } from '@/components/personal/employee-detail';

export const metadata = {
  title: 'Detalle Empleado | FrutyLab',
  description: 'Información del empleado',
};

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { name: true },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          createdBy: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  return <EmployeeDetail employee={employee} />;
}
