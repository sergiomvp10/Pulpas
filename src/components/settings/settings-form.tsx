'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Upload, X } from 'lucide-react';

interface Settings {
  pricePerGramTradicional: number;
  pricePerGramExotico: number;
  
  defaultMargin: number;
  
  shelfLifeMonths: number;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  expiryAlertDays: number;
  
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  invoiceLogoBase64: string;
}

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    pricePerGramTradicional: 10,
    pricePerGramExotico: 14,
    defaultMargin: 70,
    shelfLifeMonths: 7,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    expiryAlertDays: 30,
    businessName: 'FrutyLab',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    invoiceLogoBase64: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido' });
      return;
    }

    if (file.size > 500 * 1024) {
      setMessage({ type: 'error', text: 'La imagen debe ser menor a 500KB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings({ ...settings, invoiceLogoBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setSettings({ ...settings, invoiceLogoBase64: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando configuración...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Precios por Gramo */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Precios por Gramo</h3>
          <p className="text-sm text-gray-500">Precio base por gramo para cada categoría</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pricePerGramTradicional">Tradicional (COP/gramo)</Label>
            <Input
              id="pricePerGramTradicional"
              type="number"
              step="0.01"
              min="0"
              value={settings.pricePerGramTradicional}
              onChange={(e) => setSettings({ ...settings, pricePerGramTradicional: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerGramExotico">Exótico (COP/gramo)</Label>
            <Input
              id="pricePerGramExotico"
              type="number"
              step="0.01"
              min="0"
              value={settings.pricePerGramExotico}
              onChange={(e) => setSettings({ ...settings, pricePerGramExotico: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Márgenes y Vida Útil */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Márgenes y Vida Útil</h3>
          <p className="text-sm text-gray-500">Configuración de precios y duración de productos</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="defaultMargin">Margen de Ganancia por Defecto (%)</Label>
            <Input
              id="defaultMargin"
              type="number"
              step="1"
              min="0"
              max="100"
              value={settings.defaultMargin}
              onChange={(e) => setSettings({ ...settings, defaultMargin: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shelfLifeMonths">Vida Útil (meses)</Label>
            <Input
              id="shelfLifeMonths"
              type="number"
              step="1"
              min="1"
              value={settings.shelfLifeMonths}
              onChange={(e) => setSettings({ ...settings, shelfLifeMonths: parseInt(e.target.value) || 7 })}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Alertas de Inventario */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Alertas de Inventario</h3>
          <p className="text-sm text-gray-500">Umbrales para alertas de stock y vencimiento</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Stock Bajo (unidades)</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              step="1"
              min="1"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 10 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criticalStockThreshold">Stock Crítico (unidades)</Label>
            <Input
              id="criticalStockThreshold"
              type="number"
              step="1"
              min="1"
              value={settings.criticalStockThreshold}
              onChange={(e) => setSettings({ ...settings, criticalStockThreshold: parseInt(e.target.value) || 5 })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryAlertDays">Alerta de Vencimiento (días)</Label>
            <Input
              id="expiryAlertDays"
              type="number"
              step="1"
              min="1"
              value={settings.expiryAlertDays}
              onChange={(e) => setSettings({ ...settings, expiryAlertDays: parseInt(e.target.value) || 30 })}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Información del Negocio */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Información del Negocio</h3>
          <p className="text-sm text-gray-500">Datos de contacto y nombre del negocio</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre del Negocio</Label>
            <Input
              id="businessName"
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Teléfono</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Dirección</Label>
            <Input
              id="businessAddress"
              type="text"
              value={settings.businessAddress}
              onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Logo de Factura</h3>
          <p className="text-sm text-gray-500">Sube una imagen para mostrar en las facturas generadas</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Imagen del Logo</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
              {settings.invoiceLogoBase64 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400">Formatos: PNG, JPG. Tamaño máximo: 500KB</p>
          </div>
          {settings.invoiceLogoBase64 && (
            <div className="space-y-2">
              <Label>Vista previa del logo</Label>
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                <img 
                  src={settings.invoiceLogoBase64} 
                  alt="Logo preview" 
                  className="max-h-24 max-w-48 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
