import { EmployeeForm } from '@/components/personal/employee-form';

export const metadata = {
  title: 'Nuevo Empleado | FrutyLab',
  description: 'Registrar nuevo empleado',
};

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Empleado</h1>
        <p className="text-gray-500">
          Registra un nuevo empleado de planta
        </p>
      </div>

      <EmployeeForm />
    </div>
  );
}
