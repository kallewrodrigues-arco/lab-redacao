import { StatusRedacao, StatusProposta } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pendente_envio: 'Pendente envio',
  enviada: 'Enviada',
  corrigindo: 'Corrigindo',
  aguardando_liberacao: 'Ag. liberação',
  corrigida: 'Corrigida',
  rejeitada: 'Rejeitada',
  ilegivel: 'Ilegível',
  agendada: 'Agendada',
  ativa: 'Ativa',
  encerrada: 'Encerrada',
  descartada: 'Descartada',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pendente_envio: { bg: 'var(--bg-secondary)', color: 'var(--text-caption)' },
  enviada: { bg: 'var(--color-blue-light)', color: 'var(--color-blue-dark)' },
  corrigindo: { bg: 'var(--color-orange-light)', color: 'var(--color-orange)' },
  aguardando_liberacao: { bg: 'var(--color-orange-light)', color: 'var(--color-orange)' },
  corrigida: { bg: 'var(--color-green-light)', color: 'var(--color-green)' },
  rejeitada: { bg: 'var(--color-red-light)', color: 'var(--color-red)' },
  ilegivel: { bg: 'var(--color-red-light)', color: 'var(--color-red)' },
  agendada: { bg: 'var(--color-blue-light)', color: 'var(--color-blue-dark)' },
  ativa: { bg: 'var(--color-green-light)', color: 'var(--color-green)' },
  encerrada: { bg: 'var(--bg-hover)', color: 'var(--text-caption)' },
  descartada: { bg: 'var(--color-red-light)', color: 'var(--color-red)' },
};

interface StatusBadgeProps {
  status: StatusRedacao | StatusProposta;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, color } = STATUS_COLORS[status] ?? { bg: '#eee', color: '#333' };
  return (
    <span
      style={{
        background: bg,
        color,
        padding: '2px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '12px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
