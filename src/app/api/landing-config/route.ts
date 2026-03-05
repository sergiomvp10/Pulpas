import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

const DEFAULT_CONFIG = {
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
};

export async function GET() {
  try {
    let config = await prisma.landingPageConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      config = await prisma.landingPageConfig.create({
        data: DEFAULT_CONFIG,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching landing config:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    let config = await prisma.landingPageConfig.findFirst({
      where: { isActive: true },
    });

    if (config) {
      config = await prisma.landingPageConfig.update({
        where: { id: config.id },
        data: {
          heroTitle: body.heroTitle,
          heroSubtitle: body.heroSubtitle,
          heroImageUrl: body.heroImageUrl,
          heroButtonText: body.heroButtonText,
          whatsappUrl: body.whatsappUrl,
          contactTitle: body.contactTitle,
          contactDescription: body.contactDescription,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          contactAddress: body.contactAddress,
          workWithUsTitle: body.workWithUsTitle,
          workWithUsDescription: body.workWithUsDescription,
          workWithUsEmail: body.workWithUsEmail,
        },
      });
    } else {
      config = await prisma.landingPageConfig.create({
        data: {
          heroTitle: body.heroTitle || DEFAULT_CONFIG.heroTitle,
          heroSubtitle: body.heroSubtitle || DEFAULT_CONFIG.heroSubtitle,
          heroImageUrl: body.heroImageUrl || DEFAULT_CONFIG.heroImageUrl,
          heroButtonText: body.heroButtonText || DEFAULT_CONFIG.heroButtonText,
          whatsappUrl: body.whatsappUrl || DEFAULT_CONFIG.whatsappUrl,
          contactTitle: body.contactTitle || DEFAULT_CONFIG.contactTitle,
          contactDescription: body.contactDescription || DEFAULT_CONFIG.contactDescription,
          contactEmail: body.contactEmail || DEFAULT_CONFIG.contactEmail,
          contactPhone: body.contactPhone || DEFAULT_CONFIG.contactPhone,
          contactAddress: body.contactAddress || DEFAULT_CONFIG.contactAddress,
          workWithUsTitle: body.workWithUsTitle || DEFAULT_CONFIG.workWithUsTitle,
          workWithUsDescription: body.workWithUsDescription || DEFAULT_CONFIG.workWithUsDescription,
          workWithUsEmail: body.workWithUsEmail || DEFAULT_CONFIG.workWithUsEmail,
        },
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error saving landing config:', error);
    return NextResponse.json({ error: 'Failed to save landing config' }, { status: 500 });
  }
}
