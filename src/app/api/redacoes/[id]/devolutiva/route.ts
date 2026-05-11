import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

const COMP_TITULOS: Record<string, string> = {
  C1: 'Dominar a escrita formal',
  C2: 'Compreender o tema',
  C3: 'Interpretar e organizar ideias',
  C4: 'Dominar a argumentação',
  C5: 'Propor solução respeitosa',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const red = db.redacoes.find((r) => r.id === id);
  if (!red || red.notaFinal === undefined || red.C1 === undefined) {
    return NextResponse.json({ error: 'Devolutiva não encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    redacaoId: red.id,
    notaFinal: red.notaFinal,
    competencias: (['C1', 'C2', 'C3', 'C4', 'C5'] as const).map((cod) => ({
      codigo: cod,
      titulo: COMP_TITULOS[cod],
      nota: red[cod] as number,
    })),
    disponivelEm: red.dataEnvio ?? null,
  }, { headers: { 'Content-Type': 'application/json' } });
}
