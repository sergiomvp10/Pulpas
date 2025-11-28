'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SELLER: 'Vendedor',
  ALMACEN: 'Almacén',
  CALIDAD: 'Calidad',
  VENTAS: 'Ventas',
  PRODUCCION: 'Producción',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  SELLER: 'bg-blue-100 text-blue-800',
  ALMACEN: 'bg-yellow-100 text-yellow-800',
  CALIDAD: 'bg-green-100 text-green-800',
  VENTAS: 'bg-purple-100 text-purple-800',
  PRODUCCION: 'bg-orange-100 text-orange-800',
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PRODUCCION',
    phone: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      setSuccess(`Usuario "${data.name}" creado exitosamente con rol ${ROLE_LABELS[data.role]}`);
      setFormData({ name: '', email: '', password: '', role: 'PRODUCCION', phone: '' });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{users.length} usuario(s) registrado(s)</p>
        <Button
          variant={showForm ? "outline" : "default"}
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: juan@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCCION">Producción (solo inventario)</SelectItem>
                  <SelectItem value="VENTAS">Ventas</SelectItem>
                  <SelectItem value="ALMACEN">Almacén</SelectItem>
                  <SelectItem value="CALIDAD">Calidad</SelectItem>
                  <SelectItem value="SELLER">Vendedor</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-white"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Badge className={ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}>
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
