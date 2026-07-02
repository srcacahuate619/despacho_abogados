'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface DashboardData {
  total_expedientes: number
  activos: number
  concluidos: number
  suspendidos: number
  total_clientes: number
  total_documentos: number
  vencimientos_proximos: any[]
  ultimos_movimientos: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.resumen().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gov-muted">Cargando...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gov-muted text-sm mt-1">Resumen general del despacho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Expedientes" value={data?.total_expedientes || 0} color="text-gov-blue" />
        <StatCard label="Activos" value={data?.activos || 0} color="text-green-600" />
        <StatCard label="Clientes" value={data?.total_clientes || 0} color="text-blue-600" />
        <StatCard label="Documentos" value={data?.total_documentos || 0} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Actividad Reciente</h3>
          {data?.ultimos_movimientos?.length ? (
            <ul className="space-y-3">
              {data.ultimos_movimientos.map((m: any, i: number) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gov-muted">{m.descripcion}</span>
                  <span className="text-xs text-gov-muted">
                    {m.creado_en ? new Date(m.creado_en).toLocaleDateString() : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gov-muted">Sin actividad reciente</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Acceso Rápido</h3>
          <div className="space-y-3">
            <Link href="/expedientes" className="block p-3 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors">
              <span className="font-medium text-sm">📁 Ver Expedientes</span>
              <p className="text-xs text-gov-muted mt-1">Lista completa de expedientes</p>
            </Link>
            <Link href="/expedientes/nuevo" className="block p-3 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors">
              <span className="font-medium text-sm">➕ Nuevo Expediente</span>
              <p className="text-xs text-gov-muted mt-1">Registrar un nuevo caso</p>
            </Link>
            <Link href="/clientes" className="block p-3 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors">
              <span className="font-medium text-sm">👥 Clientes</span>
              <p className="text-xs text-gov-muted mt-1">Directorio de clientes</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-gov-muted">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}
