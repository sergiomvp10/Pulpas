import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    
    if (secret !== 'seed-locations-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const locationsToCreate = [
      { name: 'Bodega Principal', code: 'BODEGA-PRINCIPAL', description: 'Bodega principal de almacenamiento' },
      { name: 'Almacén', code: 'ALMACEN', description: 'Almacén general' },
      { name: 'Refrigerador 1', code: 'REFRIGERADOR-1', description: 'Refrigerador número 1' },
      { name: 'Refrigerador 2', code: 'REFRIGERADOR-2', description: 'Refrigerador número 2' },
    ];
    
    const results = [];
    
    for (const location of locationsToCreate) {
      const existing = await prisma.inventoryLocation.findFirst({
        where: { 
          OR: [
            { name: location.name },
            { code: location.code }
          ]
        }
      });
      
      if (existing) {
        results.push({ name: location.name, code: location.code, status: 'already_exists' });
      } else {
        const created = await prisma.inventoryLocation.create({
          data: {
            name: location.name,
            code: location.code,
            description: location.description,
            active: true,
          }
        });
        results.push({ name: created.name, code: created.code, status: 'created' });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Locations seeded successfully',
      results
    });
  } catch (error) {
    console.error('Error seeding locations:', error);
    return NextResponse.json({ 
      error: 'Failed to seed locations',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    }, { status: 500 });
  }
}
