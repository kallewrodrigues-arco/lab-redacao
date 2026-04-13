import { TagDesempenho } from '@/types';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function fetchDesempenho() {
  const res = await fetch(`${BASE}/api/dashboard/desempenho`, { cache: 'no-store' });
  return res.json();
}

const TAG_COLORS: Record<TagDesempenho, { bg: string; color: string }> = {
  Desafiar: { bg: 'var(--color-blue-light)', color: 'var(--color-blue-dark)' },
  Acompanhar: { bg: 'var(--color-green-light)', color: 'var(--color-green)' },
  Intervir: { bg: 'var(--color-red-light)', color: 'var(--color-red)' },
};

export default async function GestorRelatoriosPage() {
  const desempenho = await fetchDesempenho();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-700)' }}>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>Relatórios</h1>

      {/* Participação e média */}
      <div style={{ display: 'flex', gap: 'var(--space-500)', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-600)', flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-caption)', fontWeight: 500, marginBottom: 8 }}>Participação</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-blue)' }}>{desempenho.participacao?.percentual ?? 0}%</div>
          <div style={{ fontSize: '13px', color: 'var(--text-caption)', marginTop: 4 }}>
            {desempenho.participacao?.participaram ?? 0} de {desempenho.participacao?.total ?? 0} alunos
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-600)', flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-caption)', fontWeight: 500, marginBottom: 8 }}>Desempenho médio</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{desempenho.desempenhoMedio ?? 0}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-caption)', marginTop: 4 }}>pontos de 1000</div>
        </div>
      </div>

      {/* Por competência */}
      <section>
        <h2 style={{ margin: '0 0 var(--space-400)', fontSize: '18px', fontWeight: 600 }}>Por competência</h2>
        <div style={{ display: 'flex', gap: 'var(--space-400)', flexWrap: 'wrap' }}>
          {desempenho.porCompetencia &&
            Object.entries(desempenho.porCompetencia as Record<string, { media: number; tag: TagDesempenho }>).map(([cod, { media, tag }]) => {
              const colors = TAG_COLORS[tag] ?? { bg: '#eee', color: '#333' };
              return (
                <div
                  key={cod}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-500)',
                    minWidth: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-200)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-caption)' }}>{cod}</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{media}</span>
                  <span style={{ fontSize: '11px', background: colors.bg, color: colors.color, padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
                    {tag}
                  </span>
                </div>
              );
            })}
        </div>
      </section>

      {/* Por turma */}
      <section>
        <h2 style={{ margin: '0 0 var(--space-400)', fontSize: '18px', fontWeight: 600 }}>Por turma</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
          {(desempenho.porTurma ?? []).map((t: { turmaId: string; nome: string; media: number }) => (
            <div
              key={t.turmaId}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-400) var(--space-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 500 }}>{t.nome}</span>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>{t.media}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
