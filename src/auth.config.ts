import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const userRole = auth?.user?.role;

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        if (userRole === 'SELLER') {
          const allowedPaths = [
            '/dashboard',
            '/dashboard/sales',
            '/dashboard/sales/new',
            '/dashboard/customers',
            '/dashboard/customers/new',
          ];
          
          const isAllowed = allowedPaths.some(path => 
            nextUrl.pathname === path || nextUrl.pathname.startsWith(path + '/')
          );
          
          if (!isAllowed) {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
        }
        
        return true;
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
