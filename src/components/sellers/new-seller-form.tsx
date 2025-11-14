'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function NewSellerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    commissionRate: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commissionRate: formData.commissionRate / 100, // Convert to decimal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create seller');
      }

      const data = await response.json();
      
      setCredentials(data.credentials);
    } catch (error) {
      console.error('Error creating seller:', error);
      alert(error instanceof Error ? error.message : 'Error al crear el vendedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push('/dashboard/sellers');
    router.refresh();
  };

  if (credentials) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>¡Vendedor creado exitosamente!</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p className="font-semibold">Credenciales de acceso:</p>
            <div className="bg-gray-100 p-3 rounded space-y-1">
              <p><strong>Usuario:</strong> {credentials.email}</p>
              <p><strong>Contraseña:</strong> {credentials.password}</p>
            </div>
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Guarda estas credenciales. No se mostrarán de nuevo.
            </p>
          </AlertDescription>
        </Alert>
        <Button onClick={handleClose}>
          Volver a Vendedores
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commissionRate">Comisión (%)</Label>
        <Input
          id="commissionRate"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={formData.commissionRate}
          onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Vendedor'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/sellers')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
