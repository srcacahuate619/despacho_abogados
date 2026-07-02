'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/expedientes', label: 'Expedientes', icon: '📁' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {}

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-gov-blue text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-600">
        <h1 className="text-xl font-bold tracking-tight">LegalDesk</h1>
        <p className="text-xs text-blue-200 mt-1">Sistema de Expedientes</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-600">
        <div className="text-sm mb-2 truncate">{user.nombre || 'Usuario'}</div>
        <button
          onClick={handleLogout}
          className="text-xs text-blue-200 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
