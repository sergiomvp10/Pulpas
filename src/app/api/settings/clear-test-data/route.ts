import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    await prisma.saleLineLot.deleteMany({});
    
    await prisma.saleLine.deleteMany({});
    
    const deletedSales = await prisma.sale.deleteMany({});
    
    await prisma.inventoryMovement.deleteMany({});
    
    await prisma.qCCheck.deleteMany({});
    
    await prisma.notificationLog.deleteMany({});
    
    const deletedLots = await prisma.lot.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedSales: deletedSales.count,
      deletedLots: deletedLots.count,
      message: 'Test data cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing test data:', error);
    return NextResponse.json({ error: 'Failed to clear test data' }, { status: 500 });
  }
}
