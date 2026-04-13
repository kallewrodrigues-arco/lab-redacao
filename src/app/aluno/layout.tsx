import Link from 'next/link';

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'var(--bg-primary)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: 'var(--space-500)',
            borderBottom: '1px solid var(--border-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-300)',
          }}
        >
          <div
            style={{
              background: 'var(--color-blue)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            SAS
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-body)', flex: 1 }}>
            Laboratório de Redação
          </span>
          <Link
            href="/"
            style={{ fontSize: '12px', color: 'var(--text-caption)', textDecoration: 'none' }}
          >
            ← Sair
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 'var(--space-500)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
