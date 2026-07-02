'use client'

import type { UserRole } from '@/lib/auth'
import { hasRole } from '@/lib/auth'

export function RoleGate({ role, children, fallback = null }: { role: UserRole; children: React.ReactNode; fallback?: React.ReactNode }) {
  if (!hasRole(role)) return fallback
  return <>{children}</>
}
