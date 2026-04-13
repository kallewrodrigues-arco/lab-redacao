import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MARCAS_VALIDAS = new Set(['sas', 'coc']);

export function middleware(request: NextRequest) {
  const marca = request.cookies.get('marca')?.value;

  if (!marca || !MARCAS_VALIDAS.has(marca)) {
    const entrarUrl = new URL('/entrar', request.url);
    return NextResponse.redirect(entrarUrl);
  }

  // Propaga a marca via header para Server Components (evita re-leitura de cookie)
  const response = NextResponse.next();
  response.headers.set('x-marca', marca);
  return response;
}

export const config = {
  matcher: ['/professor/:path*', '/gestor/:path*', '/aluno/:path*'],
};
