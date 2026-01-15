import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateVariantPrices() {
  console.log('Updating product variant prices...\n');

  try {
    const variants = await prisma.productVariant.findMany({
      where: { active: true },
      include: {
        productBase: {
          include: {
            category: true,
          },
        },
      },
    });

    console.log(`Found ${variants.length} product variants to update\n`);

    let updated = 0;
    for (const variant of variants) {
      const pricePerGram = variant.productBase.category.pricePerGram;
      const calculatedPrice = variant.gramWeightG * pricePerGram;

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { pricePerUnit: calculatedPrice },
      });

      console.log(
        `✓ ${variant.productBase.name} ${variant.gramWeightG}g: ${calculatedPrice} pesos (${variant.gramWeightG}g × ${pricePerGram} pesos/g)`
      );
      updated++;
    }

    console.log(`\n✅ Updated ${updated} product variants with calculated prices!`);
  } catch (error) {
    console.error('Error updating variant prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateVariantPrices();
