import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInactiveVariants() {
  console.log('Cleaning up variants for inactive products...\n');

  try {
    const inactiveProducts = await prisma.productBase.findMany({
      where: { active: false },
      include: {
        variants: {
          where: { active: true },
        },
      },
    });

    console.log(`Found ${inactiveProducts.length} inactive products\n`);

    let totalUpdated = 0;
    for (const product of inactiveProducts) {
      if (product.variants.length > 0) {
        const result = await prisma.productVariant.updateMany({
          where: {
            productBaseId: product.id,
            active: true,
          },
          data: { active: false },
        });

        console.log(
          `✓ ${product.name}: Deactivated ${result.count} variant(s)`
        );
        totalUpdated += result.count;
      }
    }

    console.log(`\n✅ Deactivated ${totalUpdated} variants for inactive products!`);
  } catch (error) {
    console.error('Error cleaning up variants:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInactiveVariants();
