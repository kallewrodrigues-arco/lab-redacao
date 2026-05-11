import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { getHistoricoAluno } from '@/lib/redacao-evolucao';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const propostaMap: Record<string, string> = {};
  for (const p of db.propostas) propostaMap[p.id] = p.dataAgendada;

  const historico = getHistoricoAluno(db.redacoes, id, propostaMap);
  return NextResponse.json({ alunoId: id, historico }, { headers: { 'Content-Type': 'application/json' } });
}
