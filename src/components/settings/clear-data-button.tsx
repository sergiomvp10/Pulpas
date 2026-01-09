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

export function ClearDataButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearData = async () => {
    setIsClearing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/clear-test-data', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      const result = await response.json();
      setMessage({ 
        type: 'success', 
        text: `Datos limpiados exitosamente. ${result.deletedSales} ventas, ${result.deletedLots} lotes eliminados.` 
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: 'Error al limpiar los datos' });
    } finally {
      setIsClearing(false);
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
          <Button variant="destructive" disabled={isClearing}>
            {isClearing ? 'Limpiando...' : 'Limpiar Registros de Prueba'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todas las ventas registradas</li>
                <li>Todos los lotes de producción</li>
                <li>Movimientos de inventario</li>
                <li>Notificaciones</li>
              </ul>
              <p className="mt-2 font-semibold">
                NO se eliminarán: Productos, Clientes, Vendedores ni Categorías.
              </p>
              <p className="mt-2 text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
              Sí, Limpiar Datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-sm text-gray-500">
        Usa este botón para limpiar datos de prueba antes de comenzar a usar el sistema en producción.
      </p>
    </div>
  );
}
