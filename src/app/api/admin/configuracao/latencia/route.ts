import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as { aiMs: number; feedbackEtaHoras: number };

  if (body.aiMs !== undefined) db.latencia.aiMs = body.aiMs;
  if (body.feedbackEtaHoras !== undefined) db.latencia.feedbackEtaHoras = body.feedbackEtaHoras;

  return NextResponse.json(db.latencia, { headers: { 'Content-Type': 'application/json' } });
}

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.latencia, { headers: { 'Content-Type': 'application/json' } });
}
