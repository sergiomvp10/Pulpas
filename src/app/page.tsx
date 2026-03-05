import { prisma } from '@/lib/db';
import { LandingPage } from '@/components/landing/landing-page';

const DEFAULT_CONFIG = {
  id: 'default',
  heroTitle: 'Pulpa 100% Fruta',
  heroSubtitle: '¿Qué esperas para probarla?',
  heroImageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1920&q=90',
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
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function getLandingConfig() {
  try {
    const config = await prisma.landingPageConfig.findFirst({
      where: { isActive: true },
    });
    return config || DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error fetching landing config:', error);
    return DEFAULT_CONFIG;
  }
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const config = await getLandingConfig();
  return <LandingPage config={config} />;
}
