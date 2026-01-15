import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('Starting price update...');

  console.log('\n1. Updating category prices per gram...');
  
  const tradicional = await prisma.category.update({
    where: { name: 'Tradicional' },
    data: { pricePerGram: 10.0 },
  });
  console.log(`✓ Tradicional: ${tradicional.pricePerGram} pesos/gramo`);

  const exoticos = await prisma.category.update({
    where: { name: 'Exóticos' },
    data: { pricePerGram: 14.0 },
  });
  console.log(`✓ Exóticos: ${exoticos.pricePerGram} pesos/gramo`);

  console.log('\n2. Calculating and updating variant prices...');
  
  const products = await prisma.productBase.findMany({
    include: {
      category: true,
      variants: true,
    },
  });

  let updatedCount = 0;
  
  for (const product of products) {
    const pricePerGram = product.category.pricePerGram;
    
    for (const variant of product.variants) {
      const calculatedPrice = variant.gramWeightG * pricePerGram;
      
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { pricePerUnit: calculatedPrice },
      });
      
      console.log(`  ✓ ${product.name} ${variant.gramWeightG}g: ${calculatedPrice} pesos (${pricePerGram} × ${variant.gramWeightG})`);
      updatedCount++;
    }
  }

  console.log(`\n✅ Updated ${updatedCount} variant prices successfully!`);
  console.log('\nPrice calculation formula:');
  console.log('  Tradicional: weight (g) × 10 pesos/g');
  console.log('  Exóticos: weight (g) × 14 pesos/g');
}

updatePrices()
  .catch((error) => {
    console.error('Error updating prices:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
