import { withAuth } from 'next-auth/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';

// NextAuth cuida da verificação do token; sem sessão → redireciona para /login.
const authProxy = withAuth({
  pages: { signIn: '/login' },
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return authProxy(request as never, event);
}

// Protege todas as rotas, exceto login, rotas do NextAuth e estáticos.
export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
