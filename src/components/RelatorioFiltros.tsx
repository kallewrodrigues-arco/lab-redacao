'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Turma {
  id: string;
  nome: string;
}

interface Props {
  turmas: Turma[];
}

const PERIODO_OPTIONS = [
  { value: '', label: 'Desde o início' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '15', label: 'Últimos 15 dias' },
];

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FilterChip({
  options,
  selectedValue,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const selected = options.find((o) => o.value === selectedValue) ?? options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'white',
          border: '1px solid #3b9bde',
          borderRadius: 9999,
          height: 32,
          paddingLeft: 12,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#0460a1',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      >
        {selected.label}
        <ChevronDown />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'white',
          border: '1px solid #d2d9e5',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          minWidth: 196,
          zIndex: 50,
          overflow: 'hidden',
          padding: '4px 0',
        }}>
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                onClick={() => { onSelect(opt.value); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#0460a1' : '#232831',
                  background: isSelected ? '#f0f6fd' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
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

export function RelatorioFiltros({ turmas }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const turmaId = searchParams.get('turmaId') ?? '';
  const periodo = searchParams.get('periodo') ?? '';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const turmaOptions = [
    { value: '', label: 'Todas as turmas' },
    ...turmas.map((t) => ({ value: t.id, label: t.nome })),
  ];

  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <FilterChip
        options={turmaOptions}
        selectedValue={turmaId}
        onSelect={(v) => updateParam('turmaId', v)}
      />
      <FilterChip
        options={PERIODO_OPTIONS}
        selectedValue={periodo}
        onSelect={(v) => updateParam('periodo', v)}
      />
    </div>
  );
}
