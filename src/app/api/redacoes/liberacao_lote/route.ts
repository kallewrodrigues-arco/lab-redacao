import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as {
    redacaoIds: string[];
    professorId: string;
  };

  if (!body.redacaoIds || !body.professorId) {
    return NextResponse.json({ error: 'redacaoIds e professorId são obrigatórios' }, { status: 400 });
  }

  const resultados: string[] = [];

  for (const redacaoId of body.redacaoIds) {
    const redacao = db.redacoes.find((r) => r.id === redacaoId);
    if (!redacao) continue;

    const correcao = db.correcoes.find((c) => c.redacaoId === redacaoId);
    if (!correcao) continue;

    // Cria devolutiva a partir da correção
    const devolutivaExistente = db.devolutivas.find((d) => d.redacaoId === redacaoId);
    if (!devolutivaExistente) {
      db.devolutivas.push({
        id: crypto.randomUUID(),
        redacaoId,
        notaFinal: correcao.notaFinal,
        competencias: correcao.competencias,
        comentarioGeral: correcao.comentarioGeral,
        comentarios: [],
        disponivelEm: new Date().toISOString(),
      });
    }

    redacao.status = 'corrigida';
    resultados.push(redacaoId);
  }

  return NextResponse.json(
    { processadas: resultados.length, ids: resultados },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
