'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDateLongColombia } from '@/lib/date-utils';

interface EditSellerFormProps {
  seller: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    commissionRate: number;
    notes: string | null;
    createdAt: Date;
  };
}

export function EditSellerForm({ seller }: EditSellerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: seller.name,
    phone: seller.phone || '',
    email: seller.email || '',
    commissionRate: seller.commissionRate * 100, // Convert to percentage for display
    notes: seller.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/sellers/${seller.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commissionRate: formData.commissionRate / 100, // Convert back to decimal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update seller');
      }

      router.push('/dashboard/sellers');
      router.refresh();
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Error al actualizar el vendedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Fecha de Inscripción</Label>
        <Input
          type="text"
          value={formatDateLongColombia(seller.createdAt)}
          disabled
          className="bg-gray-50"
        />
      </div>

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
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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
