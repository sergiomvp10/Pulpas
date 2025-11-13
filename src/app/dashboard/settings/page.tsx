import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/settings-form';
import { ClearDataButton } from '@/components/settings/clear-data-button';

export const metadata = {
  title: 'Configuración | Sistema de Gestión de Pulpas',
  description: 'Configuración del sistema',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-gray-500">Administra la configuración del sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Negocio</CardTitle>
            <CardDescription>
              Ajusta los parámetros principales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de Prueba</CardTitle>
            <CardDescription>
              Limpia los registros de ventas y datos de prueba. No afecta productos, clientes ni vendedores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClearDataButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
