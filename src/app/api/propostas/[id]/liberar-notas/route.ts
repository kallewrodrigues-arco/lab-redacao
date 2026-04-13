import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propostaId } = await params;
  const db = getDb();

  const redacoesPendentes = db.redacoes.filter(
    (r) => r.propostaId === propostaId && r.status === 'aguardando_liberacao'
  );

  const processadas: string[] = [];

  for (const redacao of redacoesPendentes) {
    const correcao = db.correcoes.find((c) => c.redacaoId === redacao.id);
    if (!correcao) continue;

    // Cria devolutiva se ainda não existe
    const devolutivaExistente = db.devolutivas.find((d) => d.redacaoId === redacao.id);
    if (!devolutivaExistente) {
      db.devolutivas.push({
        id: crypto.randomUUID(),
        redacaoId: redacao.id,
        notaFinal: correcao.notaFinal,
        competencias: correcao.competencias,
        comentarioGeral: correcao.comentarioGeral,
        comentarios: [],
        disponivelEm: new Date().toISOString(),
      });
    }

    redacao.status = 'corrigida';
    processadas.push(redacao.id);
  }

  return NextResponse.json(
    { processadas: processadas.length, ids: processadas },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
