'use client';

import { useState, useRef, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PontoRaw {
  data: string; // ISO date
  notaFinal: number;
  competencias: Record<string, number>;
}

type NotaKey = '' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
type Agrupamento = 'semanas' | 'meses' | 'bimestres' | 'trimestres';

// ── Options ───────────────────────────────────────────────────────────────────
const NOTA_OPTIONS: { value: NotaKey; label: string }[] = [
  { value: '', label: 'Nota final' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
  { value: 'C5', label: 'C5' },
];

const AGRUPAMENTO_OPTIONS: { value: Agrupamento; label: string }[] = [
  { value: 'semanas', label: 'Semanas' },
  { value: 'meses', label: 'Meses' },
  { value: 'bimestres', label: 'Bimestres' },
  { value: 'trimestres', label: 'Trimestres' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const PT_MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function getMondayKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getGroupKey(dateStr: string, agrupamento: Agrupamento): string {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();
  switch (agrupamento) {
    case 'semanas':   return getMondayKey(dateStr);
    case 'meses':     return `${year}-M${String(month + 1).padStart(2, '0')}`;
    case 'bimestres': return `${year}-B${Math.floor(month / 2)}`;
    case 'trimestres':return `${year}-T${Math.floor(month / 3)}`;
  }
}

function getLabel(key: string, agrupamento: Agrupamento): string {
  switch (agrupamento) {
    case 'semanas': {
      const d = new Date(key + 'T00:00:00');
      return `${String(d.getDate()).padStart(2, '0')} ${PT_MONTHS_SHORT[d.getMonth()]}`;
    }
    case 'meses': {
      const m = parseInt(key.split('-M')[1], 10) - 1;
      return PT_MONTHS_SHORT[m];
    }
    case 'bimestres': {
      const b = parseInt(key.split('-B')[1], 10);
      return `${PT_MONTHS_SHORT[b * 2]}-${PT_MONTHS_SHORT[b * 2 + 1]}`;
    }
    case 'trimestres': {
      const t = parseInt(key.split('-T')[1], 10);
      return `${PT_MONTHS_SHORT[t * 3]}-${PT_MONTHS_SHORT[t * 3 + 2]}`;
    }
  }
}

function avgNums(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function aggregateData(
  pontos: PontoRaw[],
  notaKey: NotaKey,
  agrupamento: Agrupamento,
): { label: string; value: number }[] {
  const groups = new Map<string, number[]>();
  for (const p of pontos) {
    const key = getGroupKey(p.data, agrupamento);
    const raw = notaKey ? (p.competencias[notaKey] ?? 0) : p.notaFinal;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(raw);
  }
  return Array.from(groups.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-9)
    .map(([key, vals]) => ({
      label: getLabel(key, agrupamento),
      value: Math.round(avgNums(vals)), // valor bruto: 0–1000 (nota final) ou 0–200 (competência)
    }));
}

// ── Chip interno (estado local, não URL) ──────────────────────────────────────
function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FilterChip<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'white', border: '1px solid #3b9bde', borderRadius: 9999,
          height: 32, paddingLeft: 12, paddingRight: 8,
          fontSize: 14, fontWeight: 500, color: '#0460a1',
          cursor: 'pointer', whiteSpace: 'nowrap', outline: 'none', fontFamily: 'inherit',
        }}
      >
        {selected.label}
        <ChevronDown />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'white', border: '1px solid #d2d9e5', borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 160, zIndex: 50,
          overflow: 'hidden', padding: '4px 0',
        }}>
          {options.map((opt) => {
            const isSel = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', padding: '8px 16px',
                  textAlign: 'left', fontSize: 14,
                  fontWeight: isSel ? 600 : 400,
                  color: isSel ? '#0460a1' : '#232831',
                  background: isSel ? '#f0f6fd' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function EvolucaoChart({ pontos }: { pontos: PontoRaw[] }) {
  const [notaKey, setNotaKey] = useState<NotaKey>('');
  const [agrupamento, setAgrupamento] = useState<Agrupamento>('semanas');

  const dados = aggregateData(pontos, notaKey, agrupamento);

  // Escala do eixo Y depende do tipo de nota selecionado
  const maxPossible = notaKey ? 200 : 1000;
  const yTicks = notaKey
    ? [200, 160, 120, 80, 40, 0]   // competência 0–200
    : [1000, 800, 600, 400, 200, 0]; // nota final 0–1000

  const notaLabel = NOTA_OPTIONS.find((o) => o.value === notaKey)?.label ?? 'Nota final';
  const caption = notaKey
    ? `Média da competência ${notaLabel} agrupada por ${agrupamento}`
    : `Média das notas finais agrupada por ${agrupamento}`;

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-secondary)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#232831', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
            Evolução do desempenho
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#626c80', lineHeight: 1.25 }}>
            {caption}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <FilterChip options={NOTA_OPTIONS} value={notaKey} onChange={setNotaKey} />
          <FilterChip options={AGRUPAMENTO_OPTIONS} value={agrupamento} onChange={setAgrupamento} />
        </div>
      </div>

      {/* Área do gráfico */}
      {dados.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: '#626c80' }}>Sem dados de evolução disponíveis.</p>
      ) : (
        <div style={{ display: 'flex', gap: 0, height: 255 }}>
          {/* Eixo Y */}
          <div style={{ width: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 28 }}>
            {yTicks.map((v) => (
              <span key={v} style={{ fontSize: 14, color: '#626c80', textAlign: 'right', lineHeight: 1, display: 'block' }}>
                {v}
              </span>
            ))}
          </div>

          {/* Grid + Barras */}
          <div style={{ flex: 1, position: 'relative', paddingBottom: 28 }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', inset: '0 0 28px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ borderTop: '1px solid #abb3c4', width: '100%' }} />
              ))}
            </div>

            {/* Barras */}
            <div style={{ position: 'absolute', inset: '0 0 28px 8px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {dados.map((d) => {
                const heightPct = Math.max((d.value / maxPossible) * 100, 0);
                return (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: 32,
                      height: `${heightPct}%`,
                      background: '#3ccc84',
                      borderRadius: '4px 4px 0 0',
                      minHeight: d.value > 0 ? 2 : 0,
                    }} />
                  </div>
                );
              })}
            </div>

            {/* Labels X */}
            <div style={{ position: 'absolute', bottom: 0, left: 8, right: 0, display: 'flex', gap: 8, height: 24 }}>
              {dados.map((d) => (
                <div key={d.label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: '#232831', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
