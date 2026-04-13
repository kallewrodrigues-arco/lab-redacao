import { NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET() {
  const db = getDb();

  // Enriquece cada turma com o total de alunos matriculados
  const turmas = db.turmas.map((t) => ({
    ...t,
    totalEstudantes: db.alunos.filter((a) => a.turmaId === t.id).length,
  }));

  return NextResponse.json(turmas, { headers: { 'Content-Type': 'application/json' } });
}
