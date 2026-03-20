'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'SELLER'] },
  { href: '/dashboard/products', label: 'Productos', roles: ['ADMIN'] },
  { href: '/dashboard/inventory', label: 'Inventario', roles: ['ADMIN', 'PRODUCCION', 'SELLER'] },
  { href: '/dashboard/sales', label: 'Ventas', roles: ['ADMIN', 'SELLER'] },
  { href: '/dashboard/customers', label: 'Clientes', roles: ['ADMIN', 'SELLER'] },
  { href: '/dashboard/my-progress', label: 'Mi Progreso', roles: ['SELLER'] },
  { href: '/dashboard/sellers', label: 'Vendedores', roles: ['ADMIN'] },
  { href: '/dashboard/personal', label: 'Personal', roles: ['ADMIN'] },
  { href: '/dashboard/expenses', label: 'Gastos', roles: ['ADMIN'] },
  { href: '/dashboard/billing', label: 'Facturación', roles: ['ADMIN', 'SELLER'] },
  { href: '/dashboard/reports', label: 'Reportes', roles: ['ADMIN'] },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  if (!user.role) {
    return null;
  }
  
  const navItems = allNavItems.filter(item => 
    item.roles.includes(user.role as string)
  );

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-full px-4 md:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            <div className="flex items-center flex-1 gap-4 md:gap-12">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>

              <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
                <Image 
                  src="/frutylab-logo.png" 
                  alt="FrutyLab Logo" 
                  width={50} 
                  height={50}
                  className="object-contain md:w-[60px] md:h-[60px]"
                  priority
                />
                <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  FrutyLab
                </span>
              </Link>
              <div className="hidden md:flex md:flex-1 md:justify-center md:gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-5 py-3 text-base font-medium transition-colors whitespace-nowrap ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.role && (
                      <p className="text-xs text-gray-500">Rol: {user.role}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            Menú
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
