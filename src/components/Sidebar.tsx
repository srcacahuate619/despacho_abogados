'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, hasRole } from '@/lib/auth'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', minRole: 'consultor' as const },
  { href: '/expedientes', label: 'Expedientes', icon: '📁', minRole: 'consultor' as const },
  { href: '/clientes', label: 'Clientes', icon: '👥', minRole: 'consultor' as const },
].filter((l) => hasRole(l.minRole))

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onClose()
    router.push('/login')
  }

  const navContent = (
    <>
      <div className="p-5 border-b border-primary-600">
        <h1 className="text-lg font-bold tracking-tight">LegalDesk</h1>
        <p className="text-[11px] text-blue-200 mt-0.5">Sistema de Expedientes</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`sidebar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
            {user?.nombre?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate">{user?.nombre || 'Usuario'}</div>
            <div className="text-[11px] text-blue-200 capitalize">{user?.rol || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 text-xs text-blue-200 hover:text-white transition-colors w-full text-left"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gov-blue text-white min-h-screen shrink-0">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
        </div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gov-blue text-white transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
