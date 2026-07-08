'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { ToastProvider } from './Toast'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (pathname === '/login') return <ToastProvider>{children}</ToastProvider>

  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return null
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="md:hidden bg-gov-blue text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-primary-700 rounded transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold">Trejo & Asociados</h1>
              <p className="text-[10px] text-blue-200">Sistema de Expedientes</p>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
