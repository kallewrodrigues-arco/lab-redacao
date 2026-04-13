import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const devolutiva = db.devolutivas.find((d) => d.redacaoId === id);
  if (!devolutiva) {
    return NextResponse.json({ error: 'Devolutiva não encontrada' }, { status: 404 });
  }

  return NextResponse.json(devolutiva, { headers: { 'Content-Type': 'application/json' } });
}
