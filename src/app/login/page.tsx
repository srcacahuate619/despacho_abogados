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
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Trejo & Asociados</h1>
          <p className="text-blue-200 text-sm mt-1">Sistema de Gestión de Expedientes</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-5">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gov-muted mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="correo@despacho.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-muted mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <details className="mt-6 group">
            <summary className="text-xs text-gov-muted cursor-pointer hover:text-gov-blue transition-colors select-none">
              Credenciales de prueba
            </summary>
            <div className="mt-3 space-y-2 text-xs text-gov-muted bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between">
                <span>Admin</span>
                <span className="text-right font-mono">admin@despacho.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Abogado</span>
                <span className="text-right font-mono">abogado@despacho.com / abogado123</span>
              </div>
              <div className="flex justify-between">
                <span>Consultor</span>
                <span className="text-right font-mono">consulta@despacho.com / consulta123</span>
              </div>
            </div>
          </details>
        </div>

        <p className="text-center text-blue-300 text-[11px] mt-6">
          Trejo & Asociados v1.0 &mdash; Acceso restringido
        </p>
      </div>
    </div>
  )
}
