import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/settings-form';
import { ClearDataButton } from '@/components/settings/clear-data-button';
import { ResetInventoryButton } from '@/components/settings/reset-inventory-button';
import { UserManagement } from '@/components/settings/user-management';
import { LandingSettingsForm } from '@/components/settings/landing-settings-form';

export const metadata = {
  title: 'Configuración | FrutyLab',
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
            <CardTitle>Configuración del Landing Page</CardTitle>
            <CardDescription>
              Personaliza el contenido de la página principal pública (hero, contacto, trabaja con nosotros)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LandingSettingsForm />
          </CardContent>
        </Card>

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
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Crea y administra usuarios del sistema. Asigna roles para controlar el acceso a diferentes módulos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagement />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restablecer Inventario</CardTitle>
            <CardDescription>
              Elimina todo el inventario (lotes) para hacer un nuevo conteo. No afecta productos, ventas, clientes ni vendedores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetInventoryButton />
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
