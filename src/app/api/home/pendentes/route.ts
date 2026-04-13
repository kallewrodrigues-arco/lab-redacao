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
      const pendentes = redacoes.filter(
        (r) => r.status === 'aguardando_liberacao'
      ).length;
      return { p, pendentes };
    })
    .filter(({ pendentes }) => pendentes > 0)
    .sort((a, b) => new Date(b.p.dataAgendada).getTime() - new Date(a.p.dataAgendada).getTime())
    .slice(0, limit)
    .map(({ p, pendentes }) => ({
      ...p,
      colecao: db.colecoes.find((c) => c.id === p.colecaoId) ?? null,
      pendentes,
    }));

  return NextResponse.json(result, { headers: { 'Content-Type': 'application/json' } });
}
