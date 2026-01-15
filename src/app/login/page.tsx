import { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | FrutyLab',
  description: 'Sistema de Gestión FrutyLab',
  openGraph: {
    title: 'Sistema de Gestión FrutyLab',
    description: 'Sistema de Gestión FrutyLab',
    url: 'https://frutylab.vercel.app',
    siteName: 'FrutyLab',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/frutylab-og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrutyLab Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Gestión FrutyLab',
    description: 'Sistema de Gestión FrutyLab',
    images: ['/frutylab-og-image.png'],
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image
            src="/frutylab-full-logo.png"
            alt="FrutyLab - fresh fruit"
            width={300}
            height={300}
            priority
            className="w-64 h-auto"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
