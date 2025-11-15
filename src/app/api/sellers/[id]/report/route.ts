import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl;
    const fromParams = params?.id;
    const fromQuery = url.searchParams.get('sellerId') ?? undefined;
    const fromPath = url.pathname.match(/\/api\/sellers\/([^/]+)\/report/i)?.[1];
    const sellerId = fromParams ?? fromQuery ?? fromPath;

    if (!sellerId || sellerId === 'undefined') {
      return NextResponse.json(
        { 
          error: 'Missing seller id',
          message: 'Seller ID is required but was not provided',
          debug: {
            fromParams,
            fromQuery,
            fromPath,
            pathname: url.pathname,
          }
        },
        { status: 400 }
      );
    }

    const timezone = 'America/Bogota';

    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;

    const now = toZonedTime(new Date(), timezone);
    const endDate = endOfDay(now);
    const startDate = startOfDay(subDays(now, days));

    const prevStartDate = startOfDay(subDays(startDate, days));
    const prevEndDate = endOfDay(subDays(endDate, days));

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true, name: true, commissionRate: true },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const sales = await prisma.sale.findMany({
      where: {
        sellerId,
        occurredAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        saleLines: {
          include: {
            productVariant: {
              include: {
                productBase: true,
              },
            },
          },
        },
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });

    const prevSales = await prisma.sale.findMany({
      where: {
        sellerId,
        occurredAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
        status: 'COMPLETED',
      },
      select: {
        totalAmountCents: true,
      },
    });

    const salesCount = sales.length;
    const totalCents = sales.reduce((sum, sale) => sum + sale.totalAmountCents, 0);
    const commissionCents = Math.round(totalCents * seller.commissionRate);
    const averageTicketCents = salesCount > 0 ? Math.round(totalCents / salesCount) : 0;

    let unitsSold = 0;
    const productStats: Record<string, { name: string; weight: number; units: number; revenue: number }> = {};

    sales.forEach(sale => {
      (sale.saleLines ?? []).forEach(line => {
        unitsSold += line.quantityUnits;
        
        const key = line.productVariantId;
        if (!productStats[key]) {
          productStats[key] = {
            name: line.productVariant.productBase.name,
            weight: line.productVariant.gramWeightG,
            units: 0,
            revenue: 0,
          };
        }
        productStats[key].units += line.quantityUnits;
        productStats[key].revenue += line.subtotalCents;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const prevSalesCount = prevSales.length;
    const prevTotalCents = prevSales.reduce((sum, sale) => sum + sale.totalAmountCents, 0);
    const prevCommissionCents = Math.round(prevTotalCents * seller.commissionRate);

    const salesChange = prevSalesCount > 0 
      ? ((salesCount - prevSalesCount) / prevSalesCount) * 100 
      : salesCount > 0 ? 100 : 0;
    
    const revenueChange = prevTotalCents > 0 
      ? ((totalCents - prevTotalCents) / prevTotalCents) * 100 
      : totalCents > 0 ? 100 : 0;

    const commissionChange = prevCommissionCents > 0 
      ? ((commissionCents - prevCommissionCents) / prevCommissionCents) * 100 
      : commissionCents > 0 ? 100 : 0;

    const activeDays = new Set(
      sales.map(sale => toZonedTime(sale.occurredAt, timezone).toISOString().split('T')[0])
    ).size;

    return NextResponse.json({
      seller: {
        id: seller.id,
        name: seller.name,
        commissionRate: seller.commissionRate,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
      metrics: {
        salesCount,
        totalCents,
        commissionCents,
        averageTicketCents,
        unitsSold,
        activeDays,
      },
      comparison: {
        salesChange,
        revenueChange,
        commissionChange,
        prevSalesCount,
        prevTotalCents,
        prevCommissionCents,
      },
      topProducts,
      recentSales: sales.slice(0, 10).map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        occurredAt: sale.occurredAt.toISOString(),
        totalAmountCents: sale.totalAmountCents,
        itemCount: sale.saleLines?.length ?? 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching seller report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch seller report',
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        meta: (error as any)?.meta,
      },
      { status: 500 }
    );
  }
}
