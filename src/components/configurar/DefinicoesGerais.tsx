'use client';

import { useRef } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna a data de amanhã no formato YYYY-MM-DD. */
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/** Retorna a data de hoje no formato YYYY-MM-DD. */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Verifica se uma data salva está no passado (menor que hoje).
 * Se sim, o campo deve ser bloqueado.
 */
function isSavedDatePast(savedDate: string): boolean {
  if (!savedDate) return false;
  return savedDate < getToday();
}

// ── Ícones ────────────────────────────────────────────────────────────────────

const HelpCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" stroke="#abb3c4" strokeWidth="1.25" />
    <path d="M6.06 6a2 2 0 0 1 3.88.67c0 1.33-2 2-2 2" stroke="#abb3c4" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="11" r="0.75" fill="#abb3c4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="3.5" width="16" height="14" rx="2" stroke="#abb3c4" strokeWidth="1.25" />
    <path d="M6 2v3M14 2v3M2 8h16" stroke="#abb3c4" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Data bloqueada">
    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#abb3c4" strokeWidth="1.25" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#abb3c4" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

// ── Props ─────────────────────────────────────────────────────────────────────

interface DefinicoesGeraisProps {
  /** Valor atual no formato YYYY-MM-DD (string vazia = não preenchido). */
  value: string;
  /** Chamado com o novo valor sempre que o usuário altera a data. */
  onChange: (v: string) => void;
  /**
   * Data previamente salva no servidor (formato YYYY-MM-DD).
   * Quando fornecida e já passou, o campo fica somente-leitura.
   */
  savedValue?: string;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DefinicoesGerais({ value, onChange, savedValue }: DefinicoesGeraisProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tomorrow = getTomorrow();

  // Campo bloqueado quando a data já salva é passada
  const isLocked = savedValue ? isSavedDatePast(savedValue) : false;

  const isEmpty = !value;
  const displayValue = value; // YYYY-MM-DD — o input nativo trata o formato

  // Estilos do campo de input
  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    background: isLocked ? '#f5f7fa' : 'white',
    border: `1px solid ${isLocked ? '#d2d9e5' : '#abb3c4'}`,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 4,
    width: '100%',
    boxSizing: 'border-box',
    cursor: isLocked ? 'not-allowed' : 'default',
    transition: 'border-color 0.15s',
  };

  return (
    <section style={{
      background: 'white',
      border: '1px solid #d2d9e5',
      borderRadius: 16,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Título */}
      <h2 style={{
        margin: 0,
        fontSize: 24,
        fontWeight: 600,
        color: '#232831',
        lineHeight: 1.25,
      }}>
        Definições gerais
      </h2>

      {/* Campo de data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>

        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 4 }}>
          <label
            htmlFor="inicio-programa"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#232831',
              lineHeight: 1.5,
              cursor: isLocked ? 'not-allowed' : 'pointer',
            }}
          >
            Início do programa
          </label>
          <span title="Data de início do laboratório de redação nesta escola. Só pode ser alterada enquanto a data ainda não chegou.">
            <HelpCircleIcon />
          </span>
          {isLocked && (
            <span title="Esta data já passou e não pode ser alterada." style={{ display: 'flex', alignItems: 'center' }}>
              <LockIcon />
            </span>
          )}
        </div>

        {/* Input container */}
        <div
          style={inputContainerStyle}
          onClick={() => {
            if (!isLocked) inputRef.current?.showPicker?.();
          }}
        >
          {/* Suprime o ícone nativo do browser para usar apenas o botão customizado */}
          <style>{`#inicio-programa::-webkit-calendar-picker-indicator { display: none; }`}</style>

          {/* Input de data */}
          <input
            ref={inputRef}
            id="inicio-programa"
            type="date"
            value={displayValue}
            min={tomorrow}
            disabled={isLocked}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              fontWeight: 400,
              color: isEmpty ? '#808ca3' : '#232831',
              lineHeight: 1.5,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              colorScheme: 'light',
            }}
          />

          {/* Botão calendário */}
          <button
            type="button"
            disabled={isLocked}
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) inputRef.current?.showPicker?.();
            }}
            aria-label="Abrir calendário"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, flexShrink: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              padding: 12,
            }}
          >
            <CalendarIcon />
          </button>
        </div>

        {/* Mensagem de bloqueio */}
        {isLocked && (
          <p style={{
            margin: 0,
            fontSize: 12,
            color: '#808ca3',
            lineHeight: 1.5,
            paddingLeft: 4,
          }}>
            A data de início já passou e não pode ser alterada.
          </p>
        )}

      </div>
    </section>
  );
}
