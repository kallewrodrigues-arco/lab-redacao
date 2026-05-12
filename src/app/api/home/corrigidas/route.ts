import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '3', 10);

  const result = db.propostas
    .filter((p) => p.status !== 'descartada')
    .map((p) => {
      const corrigidasList = db.redacoes.filter(
        (r) => r.propostaId === p.id && r.status === 'corrigida'
      );
      if (corrigidasList.length === 0) return null;
      const latestEnvio = corrigidasList
        .map((r) => new Date(r.dataEnvio!).getTime())
        .reduce((a, b) => Math.max(a, b), 0);
      return { p, corrigidas: corrigidasList.length, latestEnvio };
    })
    .filter(Boolean)
    .sort((a, b) => b!.latestEnvio - a!.latestEnvio)
    .slice(0, limit)
    .map((item) => ({
      ...item!.p,
      colecao: db.colecoes.find((c) => c.id === item!.p.colecaoId) ?? null,
      corrigidas: item!.corrigidas,
    }));

  return NextResponse.json(result, { headers: { 'Content-Type': 'application/json' } });
}
