import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const turmaId = searchParams.get('turmaId');
  const limit = searchParams.get('limit');

  let propostas = db.propostas;

  if (status) {
    propostas = propostas.filter((p) => p.status === status);
  }

  if (turmaId) {
    propostas = propostas.filter((p) => p.turmaIds.includes(turmaId));
  }

  if (limit) {
    propostas = propostas.slice(0, parseInt(limit, 10));
  }

  const result = propostas.map((p) => ({
    ...p,
    colecao: db.colecoes.find((c) => c.id === p.colecaoId) ?? null,
  }));

  return NextResponse.json(result, { headers: { 'Content-Type': 'application/json' } });
}
