import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Exclude: api routes, static files, images, and the root landing page
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|$).*)'],
};
