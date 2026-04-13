import Link from 'next/link';

export default function ProfessorRelatoriosPage() {
  return (
    <div style={{ padding: 'var(--space-700)', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 var(--space-600)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>Relatórios</h1>
      <p style={{ color: 'var(--text-caption)' }}>
        Relatórios detalhados por turma estarão disponíveis aqui.
      </p>
      <Link href="/professor" style={{ color: 'var(--color-blue)', fontSize: '14px' }}>
        ← Voltar ao início
      </Link>
    </div>
  );
}
