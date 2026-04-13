import { NextResponse } from 'next/server';
import { resetDb } from '@/data/store';

export async function POST() {
  resetDb();
  return NextResponse.json({ ok: true });
}
