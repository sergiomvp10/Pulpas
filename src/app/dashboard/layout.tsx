import { auth } from '@/../../auth';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={session.user} />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
