import Link from 'next/link';
import { Suspense } from 'react';
import PropostaCard from '@/components/PropostaCard';
import PropostaListItem from '@/components/PropostaListItem';
import { RelatorioFiltros } from '@/components/RelatorioFiltros';
import { EvolucaoChart, PontoRaw } from '@/components/EvolucaoChart';
import { NavTabs } from '@/components/NavTabs';
import { PropostaComColecao } from '@/types';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

type PropostaComPendentes = PropostaComColecao & { pendentes: number };
type PropostaComCorrigidas = PropostaComColecao & { corrigidas: number };

interface OverviewData {
  atrasadas: number;
  pendentes: number;
  corrigidas: number;
  rejeitadas: number;
  totalAlunos: number;
  participacaoMedia: number;
  desempenhoAtual: number;
  desempenhoAnterior: number;
  delta: number;
}

async function fetchProximas(): Promise<PropostaComColecao[]> {
  const res = await fetch(`${BASE}/api/home/proximas?limit=10`, { cache: 'no-store' });
  return res.json();
}

async function fetchPendentes(): Promise<PropostaComPendentes[]> {
  const res = await fetch(`${BASE}/api/home/pendentes?limit=3`, { cache: 'no-store' });
  return res.json();
}

async function fetchCorrigidas(): Promise<PropostaComCorrigidas[]> {
  const res = await fetch(`${BASE}/api/home/corrigidas?limit=3`, { cache: 'no-store' });
  return res.json();
}

async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch(`${BASE}/api/home/overview`, { cache: 'no-store' });
  return res.json();
}

interface CompetenciaRelatorio {
  codigo: string;
  titulo: string;
  notaMedia: number;
  tag: 'Desafiar' | 'Acompanhar' | 'Intervir';
}

interface TurmaRelatorio {
  id: string;
  nome: string;
}

interface RelatorioData {
  participacaoMedia: number;
  desempenhoMedio: number;
  competencias: CompetenciaRelatorio[];
  evolucao: { semana: string; media: number }[];
  pontos: PontoRaw[];
  turmas: TurmaRelatorio[];
}

async function fetchRelatorio(turmaId?: string, periodo?: string): Promise<RelatorioData> {
  const params = new URLSearchParams();
  if (turmaId) params.set('turmaId', turmaId);
  if (periodo) params.set('periodo', periodo);
  const qs = params.toString();
  const res = await fetch(`${BASE}/api/home/relatorio${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  return res.json();
}

// ── Tag de classificação (Desafiar / Acompanhar / Intervir) ───────────────────
const TAG_CONFIG = {
  Desafiar:   { bg: '#a8f7d0', color: '#0c7742' },
  Acompanhar: { bg: '#ffe1a6', color: '#a05100' },
  Intervir:   { bg: '#ffada6', color: '#a10e00' },
};

function ClassifTag({ tag }: { tag: 'Desafiar' | 'Acompanhar' | 'Intervir' }) {
  const { bg, color } = TAG_CONFIG[tag];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, fontSize: 14, fontWeight: 500, lineHeight: 1.5,
      height: 24, padding: '0 8px', borderRadius: 9999,
      whiteSpace: 'nowrap',
    }}>
      {tag}
    </span>
  );
}

// ── Barra de progresso ────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  const fill = Math.min(Math.max(pct, 0), 100);
  return (
    <div style={{ flex: 1, height: 8, background: '#f5f7fa', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ width: `${fill}%`, height: '100%', background: '#3b9bde', borderRadius: 9999 }} />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function RelatorioGeral({ data }: { data: RelatorioData }) {
  const { participacaoMedia, desempenhoMedio, competencias, pontos, turmas } = data;

  const cardStyle: React.CSSProperties = {
    flex: 1,
    background: 'white',
    border: '1px solid var(--border-secondary)',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minWidth: 0,
  };

  const cardTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#232831',
    letterSpacing: '-0.2px',
    lineHeight: 1.25,
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: 'var(--text-body)', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
          Acompanhe o desempenho
        </h2>
        <Suspense fallback={null}>
          <RelatorioFiltros turmas={turmas} />
        </Suspense>
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: 'flex', gap: 24 }}>

        {/* Card Participação */}
        <div style={cardStyle}>
          <p style={cardTitleStyle}>Participação</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: '#232831', flexShrink: 0 }}>
                {participacaoMedia}%
              </span>
              <ProgressBar pct={participacaoMedia} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#626c80', lineHeight: 1.25 }}>
              Alunos que enviaram ao menos uma redação
            </p>
          </div>
        </div>

        {/* Card Desempenho médio */}
        <div style={cardStyle}>
          <p style={cardTitleStyle}>Desempenho médio</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: '#232831', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {desempenhoMedio.toLocaleString('pt-BR')}
                <span style={{ fontSize: 20, fontWeight: 400, color: '#626c80', marginLeft: 4 }}>/ 1.000</span>
              </span>
              <ProgressBar pct={desempenhoMedio / 10} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#626c80', lineHeight: 1.25 }}>
              Desempenho médio dos estudantes nos últimos 30 dias
            </p>
          </div>
        </div>

      </div>

      {/* ── Resultado por competência ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#232831', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
          Resultado por competência
        </h3>
        <div style={{ display: 'flex', gap: 24 }}>
          {competencias.map((c) => (
            <div key={c.codigo} style={{
              flex: 1,
              background: 'white',
              border: '1px solid var(--border-secondary)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              minWidth: 0,
              overflow: 'hidden',
            }}>
              {/* Tag código */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: '#d2d9e5', color: '#4d5666', fontSize: 14, fontWeight: 500,
                height: 24, padding: '0 8px', borderRadius: 9999, alignSelf: 'flex-start',
              }}>
                {c.codigo}
              </span>
              {/* Título */}
              <p style={{
                margin: 0, fontSize: 16, fontWeight: 500, color: '#232831',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {c.titulo}
              </p>
              {/* Nota */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: '#232831', lineHeight: 1.25 }}>
                  {c.notaMedia % 1 === 0 ? c.notaMedia : c.notaMedia.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, fontWeight: 400, color: '#626c80', width: 48 }}>
                  / 200
                </span>
              </div>
              {/* Tag classificação */}
              <ClassifTag tag={c.tag} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Gráfico Evolução do desempenho ── */}
      <EvolucaoChart pontos={pontos} />
    </section>
  );
}

function VisaoGeral({ data }: { data: OverviewData }) {
  const { atrasadas, pendentes, corrigidas, rejeitadas, totalAlunos, desempenhoAtual, desempenhoAnterior, delta } = data;
  const total = atrasadas + pendentes + corrigidas + rejeitadas;

  const scores = [
    {
      value: atrasadas,
      label: 'Atrasadas',
      color: '#ffada6',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      value: pendentes,
      label: 'A corrigir',
      color: '#ffe1a6',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      value: corrigidas,
      label: 'Corrigidas',
      color: '#a8f7d0',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
    },
    {
      value: rejeitadas,
      label: 'Descartadas',
      color: '#d2d9e5',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      ),
    },
  ];

  const barColors = ['#f47b7b', '#f7c664', '#54c985', '#d2d9e5'];

  // Half-donut SVG params (Desempenho gauge — 156×78 viewBox)
  const gaugeR = 60;
  const gaugeCx = 78;
  const gaugeCy = 72;
  const gaugeStrokeW = 12;
  const gaugeArc = `M ${gaugeCx - gaugeR} ${gaugeCy} A ${gaugeR} ${gaugeR} 0 0 1 ${gaugeCx + gaugeR} ${gaugeCy}`;
  const gaugeCirc = Math.PI * gaugeR; // ≈ 188.5
  const curDash = Math.min(desempenhoAtual / 100, 1) * gaugeCirc;
  const prevDash = Math.min(desempenhoAnterior / 100, 1) * gaugeCirc;
  // Segmented rendering: first segment 0→min, second segment min→max
  // When improved: yellow = base (0→anterior), green = gain (anterior→atual)
  // When declined:  green = current (0→atual), yellow = loss (atual→anterior)
  const isImproved = desempenhoAtual >= desempenhoAnterior;
  const minDash = Math.min(curDash, prevDash);
  const maxDash = Math.max(curDash, prevDash);
  const seg1Color = isImproved ? '#f7c664' : '#3ccc84';
  const seg2Color = isImproved ? '#3ccc84' : '#f7c664';
  const seg2Len = maxDash - minDash;

  return (
    <div style={{ display: 'flex', gap: 8, height: 187 }}>
      {/* Card 1 — Atividades */}
      <div style={{
        flex: 1,
        background: 'white',
        border: '1px solid var(--border-secondary)',
        borderRadius: 24,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 0,
      }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--text-label, #232831)' }}>
          Atividades
        </p>

        <div style={{ display: 'flex', gap: 16, paddingLeft: 8, paddingRight: 8 }}>
          {scores.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', paddingTop: 4, paddingBottom: 4, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-body, #232831)', lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{
                  width: 24,
                  height: 24,
                  borderRadius: 9999,
                  background: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#232831',
                }}>
                  {s.icon}
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-label, #232831)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Segmented bar */}
        <div style={{ display: 'flex', gap: 3, height: 16, overflow: 'hidden' }}>
          {total === 0 ? (
            <div style={{ flex: 1, background: '#d2d9e5', borderRadius: 9999 }} />
          ) : (
            scores.map((s, i) => {
              const pct = (s.value / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={s.label}
                  style={{
                    flex: `0 0 ${pct}%`,
                    background: barColors[i],
                    borderRadius: i === 0 ? '9999px 0 0 9999px' : i === scores.length - 1 ? '0 9999px 9999px 0' : 0,
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Card 2 — Alunos */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-secondary)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        width: 200,
      }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--text-label, #232831)' }}>
          Alunos
        </p>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--text-heading, #232831)', lineHeight: 1.1 }}>
          {totalAlunos}
        </p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: 'var(--text-caption, #626c80)', lineHeight: 1.4 }}>
          Inscritos no laboratório sob sua gestão
        </p>
      </div>

      {/* Card 3 — Desempenho */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-secondary)',
        borderRadius: 24,
        padding: '28px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: 219,
        flexShrink: 0,
      }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#232831' }}>
          Desempenho
        </p>

        {/* Gauge SVG */}
        <div style={{ position: 'relative', width: 156, height: 78, alignSelf: 'center' }}>
          <svg width="156" height="78" viewBox="0 0 156 78" style={{ overflow: 'visible' }}>
            {/* Rail background */}
            <path d={gaugeArc} fill="none" stroke="#d2d9e5" strokeWidth={gaugeStrokeW} strokeLinecap="round" />
            {/* Segment 1 — 0 → min(atual, anterior) */}
            {minDash > 0 && (
              <path d={gaugeArc} fill="none" stroke={seg1Color} strokeWidth={gaugeStrokeW} strokeLinecap="round"
                strokeDasharray={`${minDash} ${gaugeCirc}`} />
            )}
            {/* Segment 2 — min → max, offset to start after seg1 */}
            {seg2Len > 0.5 && (
              <path d={gaugeArc} fill="none" stroke={seg2Color} strokeWidth={gaugeStrokeW} strokeLinecap="round"
                strokeDasharray={`${seg2Len} ${gaugeCirc}`}
                strokeDashoffset={-minDash} />
            )}
          </svg>
          {/* Center text */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}>
            <p style={{ margin: 0, fontSize: 14, color: '#626c80' }}>Média</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#232831' }}>
              {desempenhoAtual}%
            </p>
          </div>
        </div>

        {/* Caption com delta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          {delta >= 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ccc84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47b7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          <span style={{ fontSize: 14, color: '#626c80', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
            {delta >= 0 ? '+' : ''}{delta}% vs última semana
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

const sectionHeadingStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 20,
  fontWeight: 600,
  color: 'var(--text-body)',
  letterSpacing: '-0.2px',
  lineHeight: 1.25,
};

const mostrarTodosStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 44,
  marginTop: 8,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-secondary)',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  color: '#626c80',
  textDecoration: 'none',
  cursor: 'pointer',
};

export default async function ProfessorPage({
  searchParams,
}: {
  searchParams: Promise<{ turmaId?: string; periodo?: string }>;
}) {
  const { turmaId, periodo } = await searchParams;
  const [proximas, pendentes, corrigidas, overview, relatorio] = await Promise.all([
    fetchProximas(),
    fetchPendentes(),
    fetchCorrigidas(),
    fetchOverview(),
    fetchRelatorio(turmaId, periodo),
  ]);

  const propostasPrincipais = proximas.slice(0, 3);
  const propostasExtras = proximas.length - 3;

  const contentStyle: React.CSSProperties = {
    padding: 'var(--space-700)',
    maxWidth: 1042,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* Cabeçalho */}
      <div style={{ ...contentStyle, paddingBottom: 'var(--space-800)' }}>

        {/* Breadcrumb */}
        <Link
          href="/professor/propostas"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 14,
            fontWeight: 500,
            color: '#0079ce',
            textDecoration: 'none',
            marginBottom: 24,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Atividades
        </Link>

        {/* Título */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 600,
            color: '#232831',
            lineHeight: 1.25,
            letterSpacing: '-0.2px',
          }}>
            Laboratório de redação
          </h1>
          <p style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(0,0,0,0.5)',
            lineHeight: 1.5,
          }}>
            Propostas novas toda a semana para praticar.
          </p>
        </div>

      </div>

      {/* NavTabs — sticky */}
      <NavTabs />

      {/* Conteúdo principal */}
      <div style={{ ...contentStyle, display: 'flex', flexDirection: 'column', gap: 48, paddingTop: 48 }}>

      {/* US1: Visão Geral */}
      <VisaoGeral data={overview} />

      {/* US2: Próximas propostas */}
      <section id="section-atividades" style={{ scrollMarginTop: 56 }}>
        <h2 style={sectionHeadingStyle}>Próximas propostas</h2>
        {proximas.length === 0 ? (
          <p style={{ color: 'var(--text-caption)' }}>Nenhuma proposta agendada.</p>
        ) : (
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', overflowX: 'auto' }}>
            {propostasPrincipais.map((p) => (
              <PropostaCard key={p.id} proposta={p} colecao={p.colecao} />
            ))}
            <Link
              href="/professor/propostas?origem=proximas"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-lg, 16px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: 24,
                textDecoration: 'none',
                flexShrink: 0,
                alignSelf: 'stretch',
              }}
            >
              {propostasExtras > 0 && (
                <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: 'var(--text-body)', lineHeight: 1.25, letterSpacing: '-0.2px' }}>
                  +{propostasExtras}
                </p>
              )}
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-caption)', lineHeight: 1.25 }}>
                Mostrar todas
              </p>
            </Link>
          </div>
        )}
      </section>

      {/* US3 + US4: duas colunas */}
      <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>

        {/* US3: Falta corrigir */}
        <section style={{ flex: 1, minWidth: 0 }}>
          <h2 style={sectionHeadingStyle}>Falta corrigir</h2>
          {pendentes.length === 0 ? (
            <p style={{ color: 'var(--text-caption)' }}>Nenhuma correção pendente.</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendentes.map((p) => (
                  <PropostaListItem
                    key={p.id}
                    proposta={p}
                    subtitle={`${p.pendentes} aguardando correção`}
                    href={`/professor/propostas/${p.id}?aba=correcao`}
                  />
                ))}
              </div>
              <Link href="/professor/propostas?status=correcoes_pendentes" style={mostrarTodosStyle}>
                Mostrar todos
              </Link>
            </>
          )}
        </section>

        {/* US4: Acompanhe o desempenho */}
        <section style={{ flex: 1, minWidth: 0 }}>
          <h2 style={sectionHeadingStyle}>Acompanhe o desempenho</h2>
          {corrigidas.length === 0 ? (
            <p style={{ color: 'var(--text-caption)' }}>Nenhuma proposta corrigida.</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {corrigidas.map((p) => (
                  <PropostaListItem
                    key={p.id}
                    proposta={p}
                    subtitle={formatDate(p.dataAgendada)}
                    href={`/professor/propostas/${p.id}?aba=resultados`}
                  />
                ))}
              </div>
              <Link href="/professor/propostas?status=corrigida" style={mostrarTodosStyle}>
                Mostrar todos
              </Link>
            </>
          )}
        </section>

      </div>

      {/* Relatório geral */}
      <div id="section-resultados" style={{ scrollMarginTop: 56 }}>
        <RelatorioGeral data={relatorio} />
      </div>

      </div>
    </>
  );
}
