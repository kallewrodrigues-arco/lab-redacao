import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '3', 10);

  const result = db.propostas
    .filter((p) => p.status !== 'descartada')
    .map((p) => {
      const redacoes = db.redacoes.filter((r) => r.propostaId === p.id);
      const total = redacoes.length;
      const corrigidas = redacoes.filter((r) => r.status === 'corrigida').length;
      return { p, total, corrigidas };
    })
    .filter(({ total, corrigidas }) => total > 0 && corrigidas === total)
    .sort((a, b) => new Date(b.p.dataAgendada).getTime() - new Date(a.p.dataAgendada).getTime())
    .slice(0, limit)
    .map(({ p, corrigidas }) => ({
      ...p,
      colecao: db.colecoes.find((c) => c.id === p.colecaoId) ?? null,
      corrigidas,
    }));

  return NextResponse.json(result, { headers: { 'Content-Type': 'application/json' } });
}
