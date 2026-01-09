'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroButtonText: string;
  whatsappUrl: string;
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  workWithUsTitle: string;
  workWithUsDescription: string;
  workWithUsEmail: string;
}

const DEFAULT_CONFIG: LandingConfig = {
  heroTitle: 'Pulpa 100% Fruta',
  heroSubtitle: '¿Qué esperas para probarla?',
  heroImageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&q=80',
  heroButtonText: 'Conoce más',
  whatsappUrl: 'https://wa.link/jg7c80',
  contactTitle: 'Contáctanos',
  contactDescription: 'Estamos aquí para ayudarte. Contáctanos para más información sobre nuestros productos.',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  workWithUsTitle: 'Trabaja con Nosotros',
  workWithUsDescription: '¿Te apasiona la vida saludable? Únete a nuestro equipo y sé parte de la revolución de las frutas naturales.',
  workWithUsEmail: '',
};

export function LandingSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/landing-config');
      if (response.ok) {
        const data = await response.json();
        setConfig({
          heroTitle: data.heroTitle || DEFAULT_CONFIG.heroTitle,
          heroSubtitle: data.heroSubtitle || DEFAULT_CONFIG.heroSubtitle,
          heroImageUrl: data.heroImageUrl || DEFAULT_CONFIG.heroImageUrl,
          heroButtonText: data.heroButtonText || DEFAULT_CONFIG.heroButtonText,
          whatsappUrl: data.whatsappUrl || DEFAULT_CONFIG.whatsappUrl,
          contactTitle: data.contactTitle || DEFAULT_CONFIG.contactTitle,
          contactDescription: data.contactDescription || DEFAULT_CONFIG.contactDescription,
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          contactAddress: data.contactAddress || '',
          workWithUsTitle: data.workWithUsTitle || DEFAULT_CONFIG.workWithUsTitle,
          workWithUsDescription: data.workWithUsDescription || DEFAULT_CONFIG.workWithUsDescription,
          workWithUsEmail: data.workWithUsEmail || '',
        });
      }
    } catch (error) {
      console.error('Error loading landing config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/landing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save landing config');
      }

      setMessage({ type: 'success', text: 'Configuración del Landing Page guardada exitosamente' });
    } catch (error) {
      console.error('Error saving landing config:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando configuración del Landing Page...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Sección Hero (Principal)</h3>
          <p className="text-sm text-gray-500">Configura el contenido principal de la landing page</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Título Principal</Label>
            <Input
              id="heroTitle"
              type="text"
              value={config.heroTitle}
              onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
              placeholder="Pulpa 100% Fruta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtítulo</Label>
            <Input
              id="heroSubtitle"
              type="text"
              value={config.heroSubtitle}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              placeholder="¿Qué esperas para probarla?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">URL de la Imagen Principal</Label>
            <Input
              id="heroImageUrl"
              type="url"
              value={config.heroImageUrl}
              onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-gray-500">
              Puedes usar imágenes de Unsplash, Pexels u otro servicio de imágenes. 
              Recomendado: imagen de alta resolución (1920x1080 o superior)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroButtonText">Texto del Botón</Label>
            <Input
              id="heroButtonText"
              type="text"
              value={config.heroButtonText}
              onChange={(e) => setConfig({ ...config, heroButtonText: e.target.value })}
              placeholder="Conoce más"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* WhatsApp */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">WhatsApp</h3>
          <p className="text-sm text-gray-500">Configura el botón flotante de WhatsApp</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsappUrl">Enlace de WhatsApp</Label>
          <Input
            id="whatsappUrl"
            type="url"
            value={config.whatsappUrl}
            onChange={(e) => setConfig({ ...config, whatsappUrl: e.target.value })}
            placeholder="https://wa.link/xxxxx"
          />
          <p className="text-xs text-gray-500">
            Puedes crear tu enlace en wa.link o usar el formato https://wa.me/NUMERO
          </p>
        </div>
      </div>

      <Separator />

      {/* Contact Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Sección de Contacto</h3>
          <p className="text-sm text-gray-500">Información de contacto que se mostrará en la landing page</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactTitle">Título de la Sección</Label>
            <Input
              id="contactTitle"
              type="text"
              value={config.contactTitle}
              onChange={(e) => setConfig({ ...config, contactTitle: e.target.value })}
              placeholder="Contáctanos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactDescription">Descripción</Label>
            <Textarea
              id="contactDescription"
              value={config.contactDescription}
              onChange={(e) => setConfig({ ...config, contactDescription: e.target.value })}
              placeholder="Estamos aquí para ayudarte..."
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <Input
                id="contactEmail"
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                placeholder="contacto@frutylab.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={config.contactPhone}
                onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactAddress">Dirección</Label>
            <Input
              id="contactAddress"
              type="text"
              value={config.contactAddress}
              onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })}
              placeholder="Calle 123 #45-67, Ciudad"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Work With Us Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Sección Trabaja con Nosotros</h3>
          <p className="text-sm text-gray-500">Configura la sección de empleo</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="workWithUsTitle">Título de la Sección</Label>
            <Input
              id="workWithUsTitle"
              type="text"
              value={config.workWithUsTitle}
              onChange={(e) => setConfig({ ...config, workWithUsTitle: e.target.value })}
              placeholder="Trabaja con Nosotros"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workWithUsDescription">Descripción</Label>
            <Textarea
              id="workWithUsDescription"
              value={config.workWithUsDescription}
              onChange={(e) => setConfig({ ...config, workWithUsDescription: e.target.value })}
              placeholder="¿Te apasiona la vida saludable?..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workWithUsEmail">Email para CVs</Label>
            <Input
              id="workWithUsEmail"
              type="email"
              value={config.workWithUsEmail}
              onChange={(e) => setConfig({ ...config, workWithUsEmail: e.target.value })}
              placeholder="rrhh@frutylab.com"
            />
            <p className="text-xs text-gray-500">
              Si no se proporciona, se mostrará el botón de WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.open('/', '_blank')}
        >
          Ver Landing Page
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
