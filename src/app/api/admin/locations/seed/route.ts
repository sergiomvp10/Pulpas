import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    
    if (secret !== 'seed-locations-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const locationsToCreate = [
      { name: 'Bodega Principal', description: 'Bodega principal de almacenamiento' },
      { name: 'Almacén', description: 'Almacén general' },
      { name: 'Refrigerador 1', description: 'Refrigerador número 1' },
      { name: 'Refrigerador 2', description: 'Refrigerador número 2' },
    ];
    
    const results = [];
    
    for (const location of locationsToCreate) {
      const existing = await prisma.inventoryLocation.findFirst({
        where: { name: location.name }
      });
      
      if (existing) {
        results.push({ name: location.name, status: 'already_exists' });
      } else {
        const created = await prisma.inventoryLocation.create({
          data: {
            name: location.name,
            description: location.description,
            active: true,
          }
        });
        results.push({ name: created.name, status: 'created' });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Locations seeded successfully',
      results
    });
  } catch (error) {
    console.error('Error seeding locations:', error);
    return NextResponse.json({ error: 'Failed to seed locations' }, { status: 500 });
  }
}
