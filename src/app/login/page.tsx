'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.login(email, password)
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.usuario))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-blue to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">LegalDesk</h1>
          <p className="text-blue-200 mt-2">Sistema de Gestión de Expedientes</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gov-muted mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="correo@despacho.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-muted mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-2.5 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          &copy; 2026 LegalDesk. Acceso restringido.
        </p>
      </div>
    </div>
  )
}
