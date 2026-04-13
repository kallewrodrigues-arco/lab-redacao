import { NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET() {
  const db = getDb();
  const { redacoes } = db;

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const atrasadas = redacoes.filter(
    (r) =>
      r.status !== 'corrigida' &&
      r.status !== 'rejeitada' &&
      r.dataEnvio &&
      now - new Date(r.dataEnvio).getTime() > SEVEN_DAYS
  ).length;

  const pendentes = redacoes.filter(
    (r) => r.status === 'aguardando_liberacao'
  ).length;

  const corrigidas = redacoes.filter((r) => r.status === 'corrigida').length;
  const rejeitadas = redacoes.filter((r) => r.status === 'rejeitada').length;

  return NextResponse.json(
    { atrasadas, pendentes, corrigidas, rejeitadas },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
