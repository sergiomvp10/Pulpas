'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmployeeActions } from '@/components/personal/employee-actions';
import { FileText, DollarSign, User } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  documentId?: string | null;
  position?: string | null;
  baseSalary?: number | null;
  _count: {
    notes: number;
    payments: number;
  };
}

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(cents);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">{employee.name}</CardTitle>
          </div>
          <EmployeeActions employeeId={employee.id} employeeName={employee.name} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {employee.position && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Cargo:</span> {employee.position}
            </p>
          )}
          {employee.phone && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Teléfono:</span> {employee.phone}
            </p>
          )}
          {employee.documentId && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Documento:</span> {employee.documentId}
            </p>
          )}
          {employee.baseSalary && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Salario Base:</span> {formatCurrency(employee.baseSalary)}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{employee._count.notes} notas</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{employee._count.payments} pagos</span>
            </div>
          </div>

          <div className="pt-3">
            <Link href={`/dashboard/personal/${employee.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                Ver Detalle
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
