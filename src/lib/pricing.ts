import { ProductVariant, Category, Lot } from '@prisma/client';

type ProductVariantWithCategory = ProductVariant & {
  productBase: {
    category: Category;
  };
};

export interface PriceCalculation {
  suggestedPriceCents: number;
  finalPriceCents: number;
  isManualPrice: boolean;
  marginUsed: number;
}

export function calculatePrice(
  variant: ProductVariantWithCategory,
  lot: Lot,
  defaultMargin: number = 0.70
): PriceCalculation {
  if (variant.manualPriceCents) {
    const marginUsed = variant.marginOverride ?? variant.productBase.category.defaultMargin ?? defaultMargin;
    const suggestedPriceCents = Math.round(lot.costPerUnitCents * (1 + marginUsed));
    
    return {
      suggestedPriceCents,
      finalPriceCents: variant.manualPriceCents,
      isManualPrice: true,
      marginUsed,
    };
  }

  const marginUsed = variant.marginOverride ?? variant.productBase.category.defaultMargin ?? defaultMargin;
  const calculatedPriceCents = lot.costPerUnitCents * (1 + marginUsed);
  
  const roundedPriceCents = Math.round(calculatedPriceCents / 100) * 100;

  return {
    suggestedPriceCents: roundedPriceCents,
    finalPriceCents: roundedPriceCents,
    isManualPrice: false,
    marginUsed,
  };
}

export function formatCurrency(cents: number, currency: string = 'COP'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const amount = parseFloat(cleaned);
  return Math.round(amount * 100); // Convert to cents
}
