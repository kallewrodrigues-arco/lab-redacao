import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const proposta = db.propostas.find((p) => p.id === id);
  if (!proposta) {
    return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
  }

  const colecao = db.colecoes.find((c) => c.id === proposta.colecaoId) ?? null;
  return NextResponse.json({ ...proposta, colecao }, { headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const proposta = db.propostas.find((p) => p.id === id);
  if (!proposta) {
    return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
  }

  const body = await request.json() as {
    status?: string;
    dataAgendada?: string;
    dataVisivel?: string;
  };

  if (body.status !== undefined) proposta.status = body.status as typeof proposta.status;
  if (body.dataAgendada !== undefined) proposta.dataAgendada = body.dataAgendada;
  if (body.dataVisivel !== undefined) proposta.dataVisivel = body.dataVisivel;

  return NextResponse.json(proposta, { headers: { 'Content-Type': 'application/json' } });
}
