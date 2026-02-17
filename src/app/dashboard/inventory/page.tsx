import { InventoryList } from '@/components/inventory/inventory-list';
import { auth } from '@/auth';

export const metadata = {
  title: 'Inventario | FrutyLab',
};

export default async function InventoryPage() {
  const session = await auth();
  const userRole = session?.user?.role || '';
  
  return <InventoryList userRole={userRole} />;
}
