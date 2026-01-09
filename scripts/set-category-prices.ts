import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setCategoryPrices() {
  console.log('Setting category prices...\n');

  try {
    const tradicional = await prisma.category.updateMany({
      where: { name: 'Tradicional' },
      data: { pricePerGram: 10.0 },
    });
    console.log(`✓ Updated Tradicional category: 10 pesos/gramo (${tradicional.count} records)`);

    const exoticos = await prisma.category.updateMany({
      where: { name: 'Exóticos' },
      data: { pricePerGram: 14.0 },
    });
    console.log(`✓ Updated Exóticos category: 14 pesos/gramo (${exoticos.count} records)`);

    console.log('\n✅ Category prices updated successfully!');
  } catch (error) {
    console.error('Error updating category prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setCategoryPrices();
