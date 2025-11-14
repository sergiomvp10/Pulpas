import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settingsRecords = await prisma.settings.findMany();
    
    const settings: Record<string, string> = {};
    settingsRecords.forEach(record => {
      settings[record.key] = record.value;
    });

    return NextResponse.json({
      pricePerGramTradicional: parseFloat(settings.pricePerGramTradicional || '10'),
      pricePerGramExotico: parseFloat(settings.pricePerGramExotico || '14'),
      defaultMargin: parseFloat(settings.defaultMargin || '70'),
      shelfLifeMonths: parseInt(settings.shelfLifeMonths || '7'),
      lowStockThreshold: parseInt(settings.lowStockThreshold || '10'),
      criticalStockThreshold: parseInt(settings.criticalStockThreshold || '5'),
      expiryAlertDays: parseInt(settings.expiryAlertDays || '30'),
      businessName: settings.businessName || 'FrutyLab',
      businessPhone: settings.businessPhone || '',
      businessEmail: settings.businessEmail || '',
      businessAddress: settings.businessAddress || '',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const settingsToSave = [
      { key: 'pricePerGramTradicional', value: body.pricePerGramTradicional.toString() },
      { key: 'pricePerGramExotico', value: body.pricePerGramExotico.toString() },
      { key: 'defaultMargin', value: body.defaultMargin.toString() },
      { key: 'shelfLifeMonths', value: body.shelfLifeMonths.toString() },
      { key: 'lowStockThreshold', value: body.lowStockThreshold.toString() },
      { key: 'criticalStockThreshold', value: body.criticalStockThreshold.toString() },
      { key: 'expiryAlertDays', value: body.expiryAlertDays.toString() },
      { key: 'businessName', value: body.businessName },
      { key: 'businessPhone', value: body.businessPhone },
      { key: 'businessEmail', value: body.businessEmail },
      { key: 'businessAddress', value: body.businessAddress },
    ];

    for (const setting of settingsToSave) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
    }

    await prisma.category.update({
      where: { name: 'Tradicional' },
      data: { pricePerGram: body.pricePerGramTradicional },
    });

    await prisma.category.update({
      where: { name: 'Exóticos' },
      data: { pricePerGram: body.pricePerGramExotico },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
