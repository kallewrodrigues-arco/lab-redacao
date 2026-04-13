import Sidebar from '@/components/Sidebar';

export default function GestorMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar persona="gestor" />
      <main style={{ flex: 1, background: 'var(--bg-primary)', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
