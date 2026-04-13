import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MARCAS_VALIDAS = new Set(['sas', 'coc']);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marca: string }> }
) {
  const { marca } = await params;

  if (!MARCAS_VALIDAS.has(marca)) {
    const url = new URL('/entrar', request.url);
    return NextResponse.redirect(url);
  }

  // Determina destino (suporte a ?next= para redirecionar a persona correta)
  const nextParam = request.nextUrl.searchParams.get('next');
  const destination = nextParam && nextParam.startsWith('/') ? nextParam : '/professor';
  const redirectUrl = new URL(destination, request.url);

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set('marca', marca, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // false para facilitar debug via DevTools no protótipo
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return response;
}
