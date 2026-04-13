import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const mensagens = db.mensagens.filter((m) => m.redacaoId === id);
  return NextResponse.json(mensagens, { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  const body = await request.json() as { alunoId: string; texto: string };

  if (!body.alunoId || !body.texto) {
    return NextResponse.json({ error: 'alunoId e texto são obrigatórios' }, { status: 400 });
  }

  const mensagem = {
    id: crypto.randomUUID(),
    redacaoId: id,
    alunoId: body.alunoId,
    texto: body.texto,
    criadoEm: new Date().toISOString(),
  };

  db.mensagens.push(mensagem);

  return NextResponse.json(mensagem, { status: 201, headers: { 'Content-Type': 'application/json' } });
}
