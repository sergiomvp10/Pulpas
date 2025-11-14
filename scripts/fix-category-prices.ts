import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCategoryPrices() {
  console.log('Fixing category prices...\n');

  try {
    const tradicional = await prisma.category.updateMany({
      where: { name: 'Tradicional' },
      data: { pricePerGram: 10 },
    });

    console.log(`✓ Tradicional: ${tradicional.count} category updated to 10 pesos/gramo`);

    const exoticos = await prisma.category.updateMany({
      where: { name: 'Exóticos' },
      data: { pricePerGram: 14 },
    });

    console.log(`✓ Exóticos: ${exoticos.count} category updated to 14 pesos/gramo`);

    const categories = await prisma.category.findMany({
      select: {
        name: true,
        pricePerGram: true,
      },
    });

    console.log('\nCurrent category prices:');
    categories.forEach(c => {
      console.log(`  ${c.name}: ${c.pricePerGram} pesos/gramo`);
    });

    console.log('\n✅ Category prices fixed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npx tsx scripts/update-variant-prices.ts');
    console.log('2. Restart the dev server (Ctrl+C, then npm run dev)');
  } catch (error) {
    console.error('Error fixing category prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryPrices();
