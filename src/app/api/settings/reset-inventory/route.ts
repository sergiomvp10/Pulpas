import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await prisma.saleLineLot.deleteMany({});
    
    await prisma.inventoryMovement.deleteMany({});
    
    await prisma.qCCheck.deleteMany({});
    
    await prisma.notificationLog.deleteMany({
      where: { lotId: { not: null } },
    });
    
    const deletedLots = await prisma.lot.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedLots: deletedLots.count,
      message: 'Inventory reset successfully',
    });
  } catch (error) {
    console.error('Error resetting inventory:', error);
    return NextResponse.json({ error: 'Failed to reset inventory' }, { status: 500 });
  }
}
