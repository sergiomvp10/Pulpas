import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  console.log('Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pulpas.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@pulpas.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+573001234567',
      isActive: true,
    },
  });
  console.log('✓ Admin user created:', admin.email);

  console.log('Creating categories...');
  const tradicional = await prisma.category.upsert({
    where: { name: 'Tradicional' },
    update: {},
    create: {
      name: 'Tradicional',
      defaultMargin: 0.70,
      description: 'Sabores tradicionales de pulpa de fruta',
      active: true,
    },
  });

  const exoticos = await prisma.category.upsert({
    where: { name: 'Exóticos' },
    update: {},
    create: {
      name: 'Exóticos',
      defaultMargin: 0.75,
      description: 'Sabores exóticos y mezclas especiales',
      active: true,
    },
  });
  console.log('✓ Categories created');

  console.log('Creating traditional products...');
  const traditionalFlavors = [
    { name: 'Mango', sku: 'MANGO' },
    { name: 'Maracuyá', sku: 'MARACUYA' },
    { name: 'Mora', sku: 'MORA' },
    { name: 'Lulo', sku: 'LULO' },
    { name: 'Piña', sku: 'PINA' },
    { name: 'Guayaba', sku: 'GUAYABA' },
    { name: 'Fresa', sku: 'FRESA' },
  ];

  const weights = [125, 250, 500, 1000];

  for (const flavor of traditionalFlavors) {
    const productBase = await prisma.productBase.upsert({
      where: { skuRoot: flavor.sku },
      update: {},
      create: {
        name: flavor.name,
        categoryId: tradicional.id,
        skuRoot: flavor.sku,
        description: `Pulpa de ${flavor.name} 100% natural sin conservantes`,
        active: true,
      },
    });

    for (const weight of weights) {
      await prisma.productVariant.upsert({
        where: { sku: `${flavor.sku}-${weight}` },
        update: {},
        create: {
          productBaseId: productBase.id,
          gramWeightG: weight,
          sku: `${flavor.sku}-${weight}`,
          active: true,
        },
      });
    }
  }
  console.log('✓ Traditional products created');

  console.log('Creating exotic products...');
  const exoticFlavors = [
    { name: 'Maracumango', sku: 'MARACUMANGO' },
    { name: 'Limonada de Feijoa', sku: 'LIM-FEIJOA' },
    { name: 'Limonada de Coco', sku: 'LIM-COCO' },
    { name: 'Limonada Cerezada', sku: 'LIM-CEREZA' },
    { name: 'Frutos Rojos', sku: 'FRUTOS-ROJOS' },
    { name: 'Tropical', sku: 'TROPICAL' },
  ];

  for (const flavor of exoticFlavors) {
    const productBase = await prisma.productBase.upsert({
      where: { skuRoot: flavor.sku },
      update: {},
      create: {
        name: flavor.name,
        categoryId: exoticos.id,
        skuRoot: flavor.sku,
        description: `${flavor.name} - Mezcla especial sin conservantes`,
        active: true,
      },
    });

    for (const weight of weights) {
      await prisma.productVariant.upsert({
        where: { sku: `${flavor.sku}-${weight}` },
        update: {},
        create: {
          productBaseId: productBase.id,
          gramWeightG: weight,
          sku: `${flavor.sku}-${weight}`,
          active: true,
        },
      });
    }
  }
  console.log('✓ Exotic products created');

  console.log('Creating inventory locations...');
  await prisma.inventoryLocation.upsert({
    where: { code: 'BODEGA-PRINCIPAL' },
    update: {},
    create: {
      name: 'Bodega Principal',
      code: 'BODEGA-PRINCIPAL',
      description: 'Almacén principal de productos',
      active: true,
    },
  });

  await prisma.inventoryLocation.upsert({
    where: { code: 'REFRIGERADOR-1' },
    update: {},
    create: {
      name: 'Refrigerador 1',
      code: 'REFRIGERADOR-1',
      description: 'Refrigerador para almacenamiento de pulpas',
      active: true,
    },
  });
  console.log('✓ Inventory locations created');

  console.log('Creating settings...');
  const settings = [
    { key: 'default_shelf_life_months', value: '7', description: 'Vida útil por defecto en meses' },
    { key: 'default_margin', value: '0.70', description: 'Margen de ganancia por defecto (70%)' },
    { key: 'timezone', value: 'America/Bogota', description: 'Zona horaria del sistema' },
    { key: 'currency', value: 'COP', description: 'Moneda del sistema' },
    { key: 'alert_days_before_expiry', value: '30', description: 'Días antes del vencimiento para alertar' },
    { key: 'block_sales_if_expired', value: 'true', description: 'Bloquear ventas de productos vencidos' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✓ Settings created');

  console.log('✅ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@pulpas.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Remember to change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
