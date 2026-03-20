'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ResetInventoryButton() {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetInventory = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/reset-inventory', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset inventory');
      }

      const result = await response.json();
      setMessage({ 
        type: 'success', 
        text: `Inventario restablecido exitosamente. ${result.deletedLots} lotes eliminados.` 
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error resetting inventory:', error);
      setMessage({ type: 'error', text: 'Error al restablecer el inventario' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isResetting}>
            {isResetting ? 'Restableciendo...' : 'Restablecer Inventario a Cero'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos los lotes de producción</li>
                <li>Movimientos de inventario</li>
                <li>Controles de calidad</li>
                <li>Notificaciones de lotes</li>
              </ul>
              <p className="mt-2 font-semibold">
                NO se eliminarán: Productos, Ventas, Clientes, Vendedores ni Categorías.
              </p>
              <p className="mt-2">
                Usa esta opción para hacer un nuevo conteo de inventario desde cero.
              </p>
              <p className="mt-2 text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetInventory} className="bg-red-600 hover:bg-red-700">
              Sí, Restablecer Inventario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-sm text-gray-500">
        Usa este botón para eliminar todo el inventario y comenzar un nuevo conteo desde cero.
      </p>
    </div>
  );
}
