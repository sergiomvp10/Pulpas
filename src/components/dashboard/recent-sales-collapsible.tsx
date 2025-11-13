'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentSalesCollapsibleProps {
  children: React.ReactNode;
}

export function RecentSalesCollapsible({ children }: RecentSalesCollapsibleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-0 right-0 z-10"
      >
        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
