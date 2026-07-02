'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (pathname === '/login') return <>{children}</>

  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
