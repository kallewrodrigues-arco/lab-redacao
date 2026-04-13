import Link from 'next/link';

type CardColor = 'red' | 'orange' | 'green' | 'gray';

interface CounterCardProps {
  label: string;
  value: number;
  color: CardColor;
  href: string;
}

const COLOR_MAP: Record<CardColor, { bg: string; value: string }> = {
  red: { bg: 'var(--color-red-light)', value: 'var(--color-red)' },
  orange: { bg: 'var(--color-orange-light)', value: 'var(--color-orange)' },
  green: { bg: 'var(--color-green-light)', value: 'var(--color-green)' },
  gray: { bg: 'var(--bg-secondary)', value: 'var(--text-caption)' },
};

export default function CounterCard({ label, value, color, href }: CounterCardProps) {
  const { bg, value: valueColor } = COLOR_MAP[color];
  return (
    <Link
      href={href}
      style={{
        background: bg,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-500)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        gap: 'var(--space-200)',
        minWidth: 100,
        flex: 1,
        transition: 'filter 0.15s',
      }}
    >
      <span
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: valueColor,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '12px',
          color: 'var(--text-caption)',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
