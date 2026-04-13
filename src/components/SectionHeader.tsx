import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  hrefLabel?: string;
}

export default function SectionHeader({ title, href, hrefLabel = 'Mostrar todos' }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-400)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-body)',
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          style={{
            fontSize: '14px',
            color: 'var(--color-blue)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
