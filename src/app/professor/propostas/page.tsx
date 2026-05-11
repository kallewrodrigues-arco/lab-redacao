'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PropostaComColecao, Redacao } from '@/types';

// Variável de módulo: só permite drag quando o pointer desceu no handle
let canDragId: string | null = null;

// ---- Helpers ----

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getTodayMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + diff);
  return today.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatWeekDay(mondayStr: string): string {
  return String(new Date(mondayStr + 'T00:00:00').getDate()).padStart(2, '0');
}

function formatWeekMonth(mondayStr: string): string {
  return PT_MONTHS[new Date(mondayStr + 'T00:00:00').getMonth()];
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function colecaoBaseName(nome: string): string {
  const idx = nome.indexOf(' • ');
  return idx >= 0 ? nome.slice(0, idx) : nome;
}

/**
 * Returns all proposals sorted by dataAgendada, preserving their actual seed dates.
 * encerradas are included so they appear in historical/filtered views.
 */
function buildInitialPropostas(raw: PropostaComColecao[], _todayMonday: string): PropostaComColecao[] {
  return raw.slice().sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada));
}

interface WeekGroup { monday: string; items: PropostaComColecao[] }

function groupByWeek(propostas: PropostaComColecao[]): WeekGroup[] {
  const map = new Map<string, PropostaComColecao[]>();
  for (const p of propostas) {
    const mon = getMondayOf(p.dataAgendada);
    if (!map.has(mon)) map.set(mon, []);
    map.get(mon)!.push(p);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monday, items]) => ({ monday, items }));
}

// ---- Computed Status ----

type ComputedStatus = 'visivel' | 'oculto' | 'atrasada' | 'correcoes_pendentes' | 'corrigida' | 'descartada';

interface EssayStats { pendentes: number; corrigidas: number; total: number }

function computeStatus(p: PropostaComColecao, todayMonday: string, todayStr: string, stats?: EssayStats): ComputedStatus {
  if (p.status === 'descartada') return 'descartada';
  if (p.dataAgendada > todayStr) return 'oculto';
  if (stats && stats.total > 0) {
    if (stats.pendentes > 0) return 'correcoes_pendentes';
    if (stats.corrigidas >= stats.total) return 'corrigida';
  }
  return 'visivel';
}

const STATUS_DISPLAY: Record<ComputedStatus, { label: string; color: string }> = {
  visivel:             { label: 'Visível',              color: 'var(--color-success-text)' },
  oculto:              { label: 'Oculto',               color: 'var(--color-info-text)' },
  atrasada:            { label: 'Atrasada',             color: 'var(--color-danger-text)' },
  correcoes_pendentes: { label: 'Falta corrigir',       color: '#d97706' },
  corrigida:           { label: 'Corrigida',            color: 'var(--color-success-text)' },
  descartada:          { label: 'Descartada',           color: 'var(--text-read-only)' },
};

function getStatusInfo(
  p: PropostaComColecao,
  todayMonday: string,
  todayStr: string,
  stats?: EssayStats,
): { text: string; color: string; computed: ComputedStatus } {
  const computed = computeStatus(p, todayMonday, todayStr, stats);
  const { label, color } = STATUS_DISPLAY[computed];
  let text = label;
  if (computed === 'visivel') text = `Visível em ${formatDate(p.dataAgendada)}`;
  else if (computed === 'oculto') text = `Oculto até ${formatDate(p.dataAgendada)}`;
  return { text, color, computed };
}

// ---- Date Filter ----

type DateFilterOption = 'proximas' | 'todas' | 'periodo';

function isInDateRange(
  p: PropostaComColecao,
  filter: DateFilterOption,
  todayMonday: string,
  start: string,
  end: string,
): boolean {
  switch (filter) {
    case 'proximas': return p.dataAgendada >= todayMonday;
    case 'todas': return true;
    case 'periodo':
      if (start && p.dataAgendada < start) return false;
      if (end && p.dataAgendada > end) return false;
      return true;
  }
}

// ---- Status Filter Options ----

const STATUS_FILTER_OPTIONS: { value: ComputedStatus; label: string }[] = [
  { value: 'visivel',             label: 'Visível' },
  { value: 'oculto',              label: 'Oculto' },
  { value: 'atrasada',            label: 'Atrasada' },
  { value: 'correcoes_pendentes', label: 'Falta corrigir' },
  { value: 'corrigida',           label: 'Corrigida' },
  { value: 'descartada',          label: 'Descartada' },
];

// ---- SVG Icons ----

const DragHandleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="6"  r="1.25" fill="currentColor" />
    <circle cx="12.5" cy="6"  r="1.25" fill="currentColor" />
    <circle cx="7.5" cy="10" r="1.25" fill="currentColor" />
    <circle cx="12.5" cy="10" r="1.25" fill="currentColor" />
    <circle cx="7.5" cy="14" r="1.25" fill="currentColor" />
    <circle cx="12.5" cy="14" r="1.25" fill="currentColor" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.5 4h11M5.5 4V2.5h5V4M3.5 4l.75 9.5h7.5L12.5 4M6.5 7v5M9.5 7v5"
      stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ---- Styles ----

const secondaryBtnStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 8,
  padding: '4px 12px',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text-caption)',
  cursor: 'pointer',
  minHeight: 32,
  minWidth: 44,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderRadius: 8,
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-caption)',
  flexShrink: 0,
  padding: 0,
};

const filterSelectStyle: React.CSSProperties = {
  appearance: 'none',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 9999,
  padding: '0 28px 0 12px',
  height: 32,
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text-caption)',
  cursor: 'pointer',
  outline: 'none',
};

const dateInputStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 9999,
  padding: '0 12px',
  height: 32,
  fontSize: 14,
  color: 'var(--text-caption)',
  cursor: 'pointer',
  outline: 'none',
};

// ---- Main Component ----

export default function ProfessorPropostasPage() {
  const router = useRouter();
  const todayMonday = useRef(getTodayMonday()).current;
  const todayStr = useRef(new Date().toISOString().split('T')[0]).current;

  const [propostas, setPropostas] = useState<PropostaComColecao[]>([]);
  const [essayStatsMap, setEssayStatsMap] = useState<Map<string, EssayStats>>(new Map());
  const [loading, setLoading] = useState(true);

  const [filterColecaoBase, setFilterColecaoBase] = useState('');
  const [filterDate, setFilterDate] = useState<DateFilterOption>('todas');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkDates, setBulkDates] = useState<Record<string, string>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Read URL params once on mount to set initial filter defaults
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const origem = params.get('origem');
    if (origem === 'proximas') {
      setFilterDate('proximas');
      setFilterStatuses(new Set(['visivel', 'oculto', 'descartada']));
    } else if (origem === 'pendentes') {
      setFilterDate('todas');
      setFilterStatuses(new Set(['correcoes_pendentes']));
    } else if (origem === 'corrigidas') {
      setFilterDate('todas');
      setFilterStatuses(new Set(['corrigida']));
    }
  }, []);

  // Load propostas and essay stats once
  useEffect(() => {
    Promise.all([
      fetch('/api/propostas').then(r => r.json()),
      fetch('/api/redacoes').then(r => r.json()).catch(() => []),
    ]).then(([propostasData, redacoesData]: [PropostaComColecao[], Redacao[]]) => {
      setPropostas(buildInitialPropostas(propostasData, todayMonday));

      const statsMap = new Map<string, EssayStats>();
      for (const r of (redacoesData || [])) {
        const curr = statsMap.get(r.propostaId) ?? { pendentes: 0, corrigidas: 0, total: 0 };
        curr.total++;
        if (r.status === 'aguardando_liberacao') curr.pendentes++;
        if (r.status === 'corrigida') curr.corrigidas++;
        statsMap.set(r.propostaId, curr);
      }
      setEssayStatsMap(statsMap);
      setLoading(false);
    });
  }, [todayMonday]);

  const patchProposta = useCallback(async (id: string, patch: Record<string, string>) => {
    const res = await fetch(`/api/propostas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      // Only merge the explicitly patched fields — the API response carries original seed
      // dates that would overwrite the client-side remapped dataAgendada.
      setPropostas(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    }
  }, []);

  const handleDiscard = useCallback((id: string) => {
    patchProposta(id, { status: 'descartada' });
  }, [patchProposta]);

  const handleBulkDiscard = useCallback(async () => {
    await Promise.all(Array.from(selected).map(id => patchProposta(id, { status: 'descartada' })));
    setSelected(new Set());
    setSelectionMode(false);
  }, [selected, patchProposta]);

  const handleDrawerConfirm = useCallback(async () => {
    await Promise.all(
      Array.from(Object.entries(bulkDates)).map(([id, newDate]) => {
        const p = propostas.find(x => x.id === id);
        if (!newDate) return Promise.resolve();
        const patch: Record<string, string> = { dataAgendada: newDate };
        if (p?.status === 'descartada') patch.status = 'agendada';
        return patchProposta(id, patch);
      })
    );
    setSelected(new Set());
    setSelectionMode(false);
    setDrawerOpen(false);
    setBulkDates({});
  }, [bulkDates, propostas, patchProposta]);

  const openDrawerForOne = useCallback((p: PropostaComColecao) => {
    setBulkDates({ [p.id]: getMondayOf(p.dataAgendada) });
    setSelected(new Set([p.id]));
    setDrawerOpen(true);
  }, []);

  const openBulkDrawer = useCallback(() => {
    if (selected.size === 0) return;
    const dates: Record<string, string> = {};
    selected.forEach(id => {
      const p = propostas.find(x => x.id === id);
      if (p) dates[id] = getMondayOf(p.dataAgendada);
    });
    setBulkDates(dates);
    setDrawerOpen(true);
  }, [selected, propostas]);

  const cancelSelection = useCallback(() => {
    setSelected(new Set());
    setSelectionMode(false);
    setBulkDates({});
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleDrop = useCallback((mondayStr: string) => {
    if (!dragId) return;
    setDropTarget(null);
    patchProposta(dragId, { dataAgendada: mondayStr });
    setDragId(null);
  }, [dragId, patchProposta]);

  const toggleStatus = (val: string) => {
    setFilterStatuses(prev => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val); else next.add(val);
      return next;
    });
  };

  const statusFilterLabel = (() => {
    if (filterStatuses.size === 0) return 'Qualquer status';
    const labels = STATUS_FILTER_OPTIONS
      .filter(o => filterStatuses.has(o.value))
      .map(o => o.label);
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return labels.join(', ');
    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
  })();

  // Unique base collection names
  const colecaoBaseNames = [...new Set(
    propostas.flatMap(p => p.colecao ? [colecaoBaseName(p.colecao.nome)] : [])
  )].sort();

  const filtered = propostas.filter(p => {
    if (!isInDateRange(p, filterDate, todayMonday, filterDateStart, filterDateEnd)) return false;
    if (filterColecaoBase && p.colecao && colecaoBaseName(p.colecao.nome) !== filterColecaoBase) return false;
    if (filterStatuses.size > 0) {
      const computed = computeStatus(p, todayMonday, todayStr, essayStatsMap.get(p.id));
      if (!filterStatuses.has(computed)) return false;
    }
    return true;
  });

  const weeks = groupByWeek(filtered);

  const drawerPropostas = Object.keys(bulkDates)
    .map(id => propostas.find(p => p.id === id))
    .filter((p): p is PropostaComColecao => !!p);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-caption)' }}>
        Carregando...
      </div>
    );
  }

  return (
    <div
      style={{ background: 'var(--bg-secondary)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
      onClick={() => statusDropdownOpen && setStatusDropdownOpen(false)}
    >

      {/* Sticky header */}
      <div style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-secondary)',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 16, minHeight: 56, paddingRight: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, overflow: 'hidden', height: 56 }}>
          <Link href="/professor" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 8, color: 'var(--text-caption)', textDecoration: 'none', flexShrink: 0,
          }}>
            <ArrowLeftIcon />
          </Link>
          <span style={{ paddingLeft: 16, fontSize: 16, fontWeight: 500, color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Agenda de propostas
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {selectionMode ? (
            <>
              <button onClick={cancelSelection} style={secondaryBtnStyle}>Cancelar</button>
              <button
                onClick={handleBulkDiscard}
                disabled={selected.size === 0}
                style={{ ...secondaryBtnStyle, color: selected.size > 0 ? 'var(--color-danger-text)' : undefined, borderColor: selected.size > 0 ? 'var(--color-danger-text)' : undefined }}
              >
                Descartar{selected.size > 0 ? ` (${selected.size})` : ''}
              </button>
              <button
                onClick={openBulkDrawer}
                disabled={selected.size === 0}
                style={{ ...secondaryBtnStyle, color: selected.size > 0 ? 'var(--text-active)' : undefined, borderColor: selected.size > 0 ? 'var(--border-active)' : undefined }}
              >
                Alterar datas{selected.size > 0 ? ` (${selected.size})` : ''}
              </button>
            </>
          ) : (
            <button onClick={() => setSelectionMode(true)} style={secondaryBtnStyle}>Selecionar</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', padding: '48px 16px' }}>

        {/* Filters */}
        <div style={{ width: '100%', maxWidth: 1128, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>

            {/* Collection filter */}
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select value={filterColecaoBase} onChange={e => setFilterColecaoBase(e.target.value)} style={filterSelectStyle}>
                <option value="">Todas as coleções</option>
                {colecaoBaseNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'var(--text-caption)', display: 'flex' }}><ChevronDownIcon /></span>
            </label>

            {/* Date range filter */}
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={filterDate}
                onChange={e => setFilterDate(e.target.value as DateFilterOption)}
                style={filterSelectStyle}
              >
                <option value="proximas">Próximas</option>
                <option value="todas">Todas</option>
                <option value="periodo">Escolher período</option>
              </select>
              <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'var(--text-caption)', display: 'flex' }}><ChevronDownIcon /></span>
            </label>

            {/* Status multi-select */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setStatusDropdownOpen(o => !o)}
                style={{
                  ...filterSelectStyle,
                  border: filterStatuses.size > 0 ? '1px solid var(--border-active)' : '1px solid var(--border-primary)',
                  color: filterStatuses.size > 0 ? 'var(--text-active)' : 'var(--text-caption)',
                  paddingRight: 28,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  background: 'var(--bg-primary)',
                }}
              >
                {statusFilterLabel}
                <span style={{ position: 'absolute', right: 8, display: 'flex', color: 'var(--text-caption)' }}><ChevronDownIcon /></span>
              </button>

              {statusDropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
                  background: 'var(--bg-primary)', border: '1px solid var(--border-secondary)',
                  borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  padding: '8px 0', minWidth: 220,
                }}>
                  {STATUS_FILTER_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 16px', cursor: 'pointer', fontSize: 14,
                        color: 'var(--text-body)',
                        background: filterStatuses.has(opt.value) ? 'var(--bg-secondary)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!filterStatuses.has(opt.value)) e.currentTarget.style.background = 'var(--bg-hover, #f5f7fa)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = filterStatuses.has(opt.value) ? 'var(--bg-secondary)' : 'transparent'; }}
                    >
                      <input
                        type="checkbox"
                        checked={filterStatuses.has(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--border-active)', flexShrink: 0 }}
                      />
                      {opt.label}
                    </label>
                  ))}
                  {filterStatuses.size > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-secondary)', marginTop: 4, paddingTop: 4 }}>
                      <button
                        onClick={() => setFilterStatuses(new Set())}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: 'var(--text-caption)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Limpar filtro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Period date inputs */}
          {filterDate === 'periodo' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-caption)' }}>De</span>
              <input
                type="date"
                value={filterDateStart}
                onChange={e => setFilterDateStart(e.target.value)}
                onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()}
                style={dateInputStyle}
              />
              <span style={{ fontSize: 13, color: 'var(--text-caption)' }}>até</span>
              <input
                type="date"
                value={filterDateEnd}
                onChange={e => setFilterDateEnd(e.target.value)}
                onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()}
                style={dateInputStyle}
              />
            </div>
          )}
        </div>

        {/* Week list */}
        <div style={{ width: '100%', maxWidth: 1128, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 14, fontWeight: 500, color: 'var(--text-caption)' }}>
            <div style={{ width: 88, flexShrink: 0 }}>Semanas</div>
            <div style={{ flex: 1 }}>Propostas</div>
          </div>

          {weeks.length === 0 ? (
            <p style={{ color: 'var(--text-caption)' }}>Nenhuma proposta encontrada.</p>
          ) : weeks.map(({ monday, items }) => {
            const isActive = monday === todayMonday;
            return (
              <div key={monday} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
                onDragOver={e => { e.preventDefault(); setDropTarget(monday); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
                onDrop={() => handleDrop(monday)}
              >
                {/* Week label */}
                <div style={{
                  width: 88, flexShrink: 0, paddingTop: 4, paddingRight: 48,
                  borderTop: isActive ? '2px solid var(--icon-active)' : '1px solid var(--text-caption)',
                  color: isActive ? 'var(--text-active)' : 'var(--text-caption)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                    {formatWeekDay(monday)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25, textAlign: 'center' }}>
                    {formatWeekMonth(monday)}
                  </span>
                </div>

                {/* Proposals */}
                <div style={{
                  flex: 1, minWidth: 0,
                  outline: dropTarget === monday && dragId ? '2px dashed var(--border-active)' : 'none',
                  borderRadius: 16, transition: 'outline 0.1s',
                }}>
                  {items.map((p, idx) => {
                    const isFirst = idx === 0;
                    const isSingle = items.length === 1;
                    const isLast = idx === items.length - 1;
                    const isDescartada = p.status === 'descartada';
                    const { text: statusText, color: statusColor, computed: computedStatus } = getStatusInfo(p, todayMonday, todayStr, essayStatsMap.get(p.id));
                    const isSelected = selected.has(p.id);
                    const borderRadius = isSingle ? 16 : isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : 0;
                    const abaDestino = computedStatus === 'corrigida'
                      ? 'resultados'
                      : (computedStatus === 'correcoes_pendentes' || computedStatus === 'visivel')
                        ? 'correcao'
                        : 'proposta';

                    return (
                      <div key={p.id}
                        draggable={!selectionMode}
                        onDragStart={e => {
                          if (selectionMode || canDragId !== p.id) { e.preventDefault(); return; }
                          setDragId(p.id);
                        }}
                        onDragEnd={() => { setDragId(null); canDragId = null; }}
                        onClick={() => { if (!selectionMode) router.push(`/professor/propostas/${p.id}?aba=${abaDestino}`); }}
                        style={{
                          background: 'var(--bg-primary)',
                          height: 84,
                          display: 'flex', alignItems: 'center',
                          border: '1px solid var(--border-secondary)',
                          ...(!isFirst && !isSingle ? { borderTop: 'none' } : {}),
                          borderRadius,
                          opacity: dragId === p.id ? 0.4 : 1,
                          cursor: selectionMode ? 'default' : 'pointer',
                        }}
                      >
                        {/* Drag handle ou checkbox */}
                        <div
                          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-caption)', cursor: selectionMode ? 'pointer' : 'grab' }}
                          onPointerDown={() => { if (!selectionMode) canDragId = p.id; }}
                          onPointerUp={() => { canDragId = null; }}
                          onClick={e => { e.stopPropagation(); if (selectionMode) toggleSelected(p.id); }}
                        >
                          {selectionMode ? (
                            <input type="checkbox" checked={isSelected}
                              onChange={() => toggleSelected(p.id)}
                              onClick={e => e.stopPropagation()}
                              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--border-active)' }}
                            />
                          ) : (
                            <DragHandleIcon />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{
                          flex: 1, minWidth: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          paddingTop: 16, paddingBottom: 16, gap: 16,
                        }}>
                          {/* Collection + title */}
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, opacity: isDescartada ? 0.4 : 1 }}>
                            {p.colecao && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: p.colecao.cor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, color: p.colecao.cor }}>{p.colecao.nome.charAt(0)}</span>
                                </div>
                                <span style={{ fontSize: 14, color: p.colecao.cor, letterSpacing: '0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.colecao.nome}
                                </span>
                              </div>
                            )}
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--text-body)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.titulo}
                            </p>
                          </div>

                          {/* Status */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, flexShrink: 0 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 500, color: statusColor, whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                              {statusText}
                            </span>
                          </div>

                          {/* Icon action buttons (hidden in selection mode) */}
                          {!selectionMode && (
                            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                              <button
                                onClick={e => { e.stopPropagation(); openDrawerForOne(p); }}
                                style={iconBtnStyle}
                                title={isDescartada ? 'Agendar' : 'Alterar data'}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(115,127,186,0.14)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <CalendarIcon />
                              </button>
                              {!isDescartada && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleDiscard(p.id); }}
                                  style={iconBtnStyle}
                                  title="Descartar"
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(115,127,186,0.14)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alterar Datas Drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.32)' }} onClick={() => setDrawerOpen(false)} />
          <div style={{ width: 400, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>Alterar datas</span>
              <button onClick={() => setDrawerOpen(false)} style={{ ...iconBtnStyle, width: 36, height: 36 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
              {drawerPropostas.map(p => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.colecao && (
                    <span style={{ fontSize: 12, color: p.colecao.cor, fontWeight: 500 }}>{p.colecao.nome}</span>
                  )}
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-body)', lineHeight: 1.4 }}>{p.titulo}</p>
                  <input
                    type="date"
                    value={bulkDates[p.id] ?? getMondayOf(p.dataAgendada)}
                    onChange={e => setBulkDates(d => ({ ...d, [p.id]: e.target.value }))}
                    onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    style={{ fontSize: 14, padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'var(--text-body)', background: 'var(--bg-primary)', cursor: 'pointer', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-secondary)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setDrawerOpen(false)} style={secondaryBtnStyle}>Cancelar</button>
              <button
                onClick={handleDrawerConfirm}
                style={{ ...secondaryBtnStyle, background: 'var(--text-active)', color: '#fff', border: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-blue-dark)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--text-active)')}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
