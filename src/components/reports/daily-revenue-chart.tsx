'use client';

import { formatCurrency } from '@/lib/pricing';

interface DailyRevenue {
  day: number;
  revenue: number;
}

interface DailyRevenueChartProps {
  dailyData: DailyRevenue[];
}

export function DailyRevenueChart({ dailyData }: DailyRevenueChartProps) {
  if (dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No hay datos de ventas este mes
      </div>
    );
  }

  const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1);

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Ingresos Diarios del Mes</h3>
      <div className="h-56 md:h-64 flex items-end justify-between gap-1 pb-8 relative">
        {dailyData.map((data) => {
          const heightPercent = (data.revenue / maxRevenue) * 100;
          
          return (
            <div key={data.day} className="flex-1 h-full flex flex-col items-center group relative">
              <div 
                className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t relative"
                style={{ height: `${Math.max(heightPercent, 2)}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {formatCurrency(data.revenue)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 absolute -bottom-6">
                {data.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
