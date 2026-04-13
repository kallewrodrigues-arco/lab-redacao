import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

function getTodayMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + diff);
  return today.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '3', 10);
  const todayMonday = getTodayMonday();

  const proximas = db.propostas
    .filter((p) => p.status === 'agendada' && p.dataAgendada >= todayMonday)
    .sort((a, b) => new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime())
    .slice(0, limit)
    .map((p) => ({
      ...p,
      colecao: db.colecoes.find((c) => c.id === p.colecaoId) ?? null,
    }));

  return NextResponse.json(proximas, { headers: { 'Content-Type': 'application/json' } });
}
