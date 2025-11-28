'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/pricing';
import { formatDateShortColombia } from '@/lib/date-utils';
import { Pencil, Trash2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
}

interface Lot {
  id: string;
  code: string;
  productionDate: string;
  expiryDate: string;
  unitsInitial: number;
  unitsOnHand: number;
  costPerUnitCents: number;
  status: string;
  notes: string | null;
  productVariant: {
    id: string;
    gramWeightG: number;
    productBase: {
      id: string;
      name: string;
    };
  };
  location: Location | null;
}

export function InventoryList() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    unitsOnHand: 0,
    costPerUnitCents: 0,
    locationId: '',
    notes: '',
    status: 'APPROVED',
  });

  const fetchLots = async () => {
    try {
      const response = await fetch('/api/lots/list');
      if (response.ok) {
        const data = await response.json();
        setLots(data);
      }
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchLocations();
  }, []);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);

  const handleSelectLot = (lotId: string) => {
    setSelectedLotId(selectedLotId === lotId ? null : lotId);
    setError('');
  };

  const handleOpenEditModal = () => {
    if (!selectedLot) return;
    setEditForm({
      unitsOnHand: selectedLot.unitsOnHand,
      costPerUnitCents: selectedLot.costPerUnitCents,
      locationId: selectedLot.location?.id || '',
      notes: selectedLot.notes || '',
      status: selectedLot.status,
    });
    setIsEditModalOpen(true);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!selectedLotId) return;
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/lots/${selectedLotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el lote');
      }

      setIsEditModalOpen(false);
      await fetchLots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el lote');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLotId) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este lote? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/lots/${selectedLotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el lote');
      }

      setSelectedLotId(null);
      await fetchLots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el lote');
    } finally {
      setIsDeleting(false);
    }
  };

  const nowColombia = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  };

  if (isLoading) {
    return <div>Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-gray-500">Control de lotes y stock disponible</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditModal}
            disabled={!selectedLotId}
            title={selectedLotId ? 'Editar lote seleccionado' : 'Selecciona un lote primero'}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={!selectedLotId || isDeleting}
            title={selectedLotId ? 'Eliminar lote seleccionado' : 'Selecciona un lote primero'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/dashboard/inventory/new">Añadir Producción</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {lots.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No hay lotes en inventario</p>
            </CardContent>
          </Card>
        ) : (
          lots.map((lot) => {
            const daysUntilExpiry = differenceInDays(new Date(lot.expiryDate), nowColombia());
            const isExpiringSoon = daysUntilExpiry <= 30;
            const isExpired = daysUntilExpiry < 0;
            const isSelected = selectedLotId === lot.id;

            return (
              <Card
                key={lot.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => handleSelectLot(lot.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {lot.productVariant.productBase.name} {lot.productVariant.gramWeightG}g
                        </CardTitle>
                        <p className="text-sm text-gray-500">Lote: {lot.code}</p>
                      </div>
                    </div>
                    <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'outline'}>
                      {isExpired ? 'Vencido' : `${daysUntilExpiry} días`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Unidades Disponibles</p>
                      <p className="text-lg font-bold">{lot.unitsOnHand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Costo Unitario</p>
                      <p className="text-lg font-bold">{formatCurrency(lot.costPerUnitCents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Producción</p>
                      <p className="text-sm">{formatDateShortColombia(lot.productionDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                      <p className="text-sm">{formatDateShortColombia(lot.expiryDate)}</p>
                    </div>
                  </div>
                  {lot.location && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">Ubicación</p>
                      <p className="text-sm">{lot.location.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lote</DialogTitle>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                <p><strong>Producto:</strong> {selectedLot.productVariant.productBase.name} {selectedLot.productVariant.gramWeightG}g</p>
                <p><strong>Código:</strong> {selectedLot.code}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitsOnHand">Unidades Disponibles</Label>
                <Input
                  id="unitsOnHand"
                  type="number"
                  min="0"
                  value={editForm.unitsOnHand}
                  onChange={(e) => setEditForm({ ...editForm, unitsOnHand: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerUnitCents">Costo Unitario (centavos)</Label>
                <Input
                  id="costPerUnitCents"
                  type="number"
                  min="0"
                  value={editForm.costPerUnitCents}
                  onChange={(e) => setEditForm({ ...editForm, costPerUnitCents: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">
                  {formatCurrency(editForm.costPerUnitCents)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationId">Ubicación</Label>
                <Select
                  value={editForm.locationId}
                  onValueChange={(value) => setEditForm({ ...editForm, locationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin ubicación</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Aprobado</SelectItem>
                    <SelectItem value="HOLD">En espera</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
