import { NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.professores, { headers: { 'Content-Type': 'application/json' } });
}
