import Link from 'next/link';

const personas = [
  {
    key: 'gestor',
    emoji: '👤',
    label: 'Gestor',
    description: 'Acompanhe o desempenho e configure o laboratório de redação',
    href: '/gestor',
    color: 'var(--color-blue)',
    bg: 'var(--color-blue-light)',
  },
  {
    key: 'professor',
    emoji: '📚',
    label: 'Professor',
    description: 'Valide correções e gerencie propostas da turma',
    href: '/professor',
    color: 'var(--color-green)',
    bg: 'var(--color-green-light)',
  },
  {
    key: 'aluno',
    emoji: '✏️',
    label: 'Aluno',
    description: 'Envie redações e veja suas devolutivas',
    href: '/aluno',
    color: 'var(--color-purple)',
    bg: 'var(--color-purple-light)',
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-700)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-700)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-300)',
            marginBottom: 'var(--space-400)',
          }}
        >
          <div
            style={{
              background: 'var(--color-blue)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: 1,
            }}
          >
            SAS
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 700,
              color: 'var(--text-body)',
            }}
          >
            Laboratório de Redação
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-caption)', fontSize: '16px' }}>
          Escolha sua persona para navegar no protótipo
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-600)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {personas.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            style={{
              background: 'var(--bg-primary)',
              border: '2px solid var(--border-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-700)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-400)',
              textDecoration: 'none',
              width: 220,
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: p.bg,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              {p.emoji}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: p.color,
                  marginBottom: 'var(--space-200)',
                }}
              >
                {p.label}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-caption)', lineHeight: 1.5 }}>
                {p.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 'var(--space-800)', fontSize: '12px', color: 'var(--text-placeholder)' }}>
        Fase 1 — Protótipo navegável
      </p>
    </main>
  );
}
