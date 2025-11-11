import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sistema de Gestión de Pulpas',
  description: 'Inicia sesión en el sistema de gestión de pulpas',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sistema de Gestión de Pulpas
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para acceder al sistema
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
