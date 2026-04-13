'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

// Rotas que devem ocupar a tela inteira, sem a sidebar global
const FULL_SCREEN_PATTERNS = [
  /^\/professor\/propostas\/[^/]+/,
]

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullScreen = FULL_SCREEN_PATTERNS.some(p => p.test(pathname))

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar persona="professor" />
      <main style={{ flex: 1, background: 'var(--bg-primary)', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
