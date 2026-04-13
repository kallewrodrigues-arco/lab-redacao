import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { AjusteLiberacao } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  const body = await request.json() as {
    professorId: string;
    ajustes: AjusteLiberacao[];
    comentarioGeral?: string;
  };

  if (!body.professorId) {
    return NextResponse.json({ error: 'professorId é obrigatório' }, { status: 400 });
  }

  // Cria ou atualiza validação
  const liberacaoExistente = db.liberacoes.find((v) => v.redacaoId === id);
  const liberacao = {
    id: liberacaoExistente?.id ?? crypto.randomUUID(),
    redacaoId: id,
    professorId: body.professorId,
    ajustes: body.ajustes ?? [],
    comentarioGeral: body.comentarioGeral,
    liberadoEm: new Date().toISOString(),
  };

  if (liberacaoExistente) {
    Object.assign(liberacaoExistente, liberacao);
  } else {
    db.liberacoes.push(liberacao);
  }

  // Cria devolutiva a partir da correção + ajustes
  const correcao = db.correcoes.find((c) => c.redacaoId === id);
  if (correcao) {
    const competenciasAjustadas = correcao.competencias.map((comp) => {
      const ajuste = body.ajustes?.find((a) => a.competenciaCodigo === comp.codigo);
      return {
        ...comp,
        nota: ajuste?.notaAjustada !== undefined ? ajuste.notaAjustada : comp.nota,
        comentario: ajuste?.comentarioAdicional
          ? `${comp.comentario} [Professor: ${ajuste.comentarioAdicional}]`
          : comp.comentario,
      };
    });

    const notaFinal = competenciasAjustadas.reduce((sum, c) => sum + c.nota, 0);

    const devolutivaExistente = db.devolutivas.find((d) => d.redacaoId === id);
    const devolutiva = {
      id: devolutivaExistente?.id ?? crypto.randomUUID(),
      redacaoId: id,
      notaFinal,
      competencias: competenciasAjustadas,
      comentarioGeral: body.comentarioGeral ?? correcao.comentarioGeral,
      comentarios: devolutivaExistente?.comentarios ?? [],
      disponivelEm: new Date().toISOString(),
    };

    if (devolutivaExistente) {
      Object.assign(devolutivaExistente, devolutiva);
    } else {
      db.devolutivas.push(devolutiva);
    }
  }

  // Muda status da redação
  redacao.status = 'corrigida';

  return NextResponse.json(liberacao, { headers: { 'Content-Type': 'application/json' } });
}
