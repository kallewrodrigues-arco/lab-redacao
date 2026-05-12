import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

const COMPETENCIAS_INFO = [
  { codigo: 'C1' as const, titulo: 'Dominar a escrita formal' },
  { codigo: 'C2' as const, titulo: 'Compreender o tema' },
  { codigo: 'C3' as const, titulo: 'Interpretar e organizar ideias' },
  { codigo: 'C4' as const, titulo: 'Dominar a argumentação' },
  { codigo: 'C5' as const, titulo: 'Propor solução respeitosa' },
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const correcao = db.correcoes.find((c) => c.redacaoId === id);
  if (correcao) {
    return NextResponse.json(correcao);
  }

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  const competencias = COMPETENCIAS_INFO.map(({ codigo, titulo }) => ({
    codigo,
    titulo,
    nota: redacao[codigo] ?? 0,
    comentario: '',
  }));

  return NextResponse.json({
    id: `rascunho-${id}`,
    redacaoId: id,
    notaFinal: redacao.notaFinal ?? 0,
    competencias,
    comentarioGeral: '',
    geradoEm: redacao.dataEnvio ?? new Date().toISOString(),
  });
}
