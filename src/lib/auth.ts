export type UserRole = 'admin' | 'abogado' | 'consultor'

export interface UserInfo {
  id: number
  email: string
  nombre: string
  rol: UserRole
}

export function getUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const roleHierarchy: Record<UserRole, number> = {
  consultor: 0,
  abogado: 1,
  admin: 2,
}

export function hasRole(minRole: UserRole): boolean {
  const user = getUser()
  if (!user) return false
  return roleHierarchy[user.rol] >= roleHierarchy[minRole]
}

export function isAdmin(): boolean {
  return hasRole('admin')
}

export function canEdit(): boolean {
  return hasRole('abogado')
}

export function canOnlyRead(): boolean {
  const user = getUser()
  return user?.rol === 'consultor'
}
