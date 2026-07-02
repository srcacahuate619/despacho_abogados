'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { CardSkeleton } from '@/components/Skeleton'
import { RoleGate } from '@/components/RoleGate'

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

  if (loading) return (
    <div>
      <SkeletonHeader />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  const stats = [
    { label: 'Expedientes', value: data?.total_expedientes || 0, color: 'text-gov-blue' },
    { label: 'Activos', value: data?.activos || 0, color: 'text-green-600' },
    { label: 'Clientes', value: data?.total_clientes || 0, color: 'text-blue-600' },
    { label: 'Documentos', value: data?.total_documentos || 0, color: 'text-purple-600' },
  ]

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <p className="text-gov-muted text-xs md:text-sm mt-1">Resumen general del despacho</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gov-border shadow-sm p-4 md:p-6">
            <p className="text-xs md:text-sm text-gov-muted">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl border border-gov-border shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base mb-4">Actividad Reciente</h3>
          {data?.ultimos_movimientos?.length ? (
            <ul className="space-y-3">
              {data.ultimos_movimientos.slice(0, 5).map((m: any, i: number) => (
                <li key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-gov-muted truncate mr-2">{m.descripcion}</span>
                  <span className="text-xs text-gov-muted shrink-0">
                    {m.creado_en ? new Date(m.creado_en).toLocaleDateString() : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gov-muted py-4 text-center">Sin actividad reciente</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gov-border shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base mb-4">Acceso Rápido</h3>
          <div className="space-y-3">
            <Link href="/expedientes" className="block p-3 md:p-4 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors active:bg-gray-100">
              <span className="font-medium text-sm">📁 Ver Expedientes</span>
              <p className="text-xs text-gov-muted mt-0.5">Lista completa de expedientes</p>
            </Link>
            <RoleGate role="abogado">
              <Link href="/expedientes/nuevo" className="block p-3 md:p-4 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors active:bg-gray-100">
                <span className="font-medium text-sm">➕ Nuevo Expediente</span>
                <p className="text-xs text-gov-muted mt-0.5">Registrar un nuevo caso</p>
              </Link>
            </RoleGate>
            <Link href="/clientes" className="block p-3 md:p-4 rounded-lg border border-gov-border hover:bg-gray-50 transition-colors active:bg-gray-100">
              <span className="font-medium text-sm">👥 Clientes</span>
              <p className="text-xs text-gov-muted mt-0.5">Directorio de clientes</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonHeader() {
  return (
    <div className="mb-6 md:mb-8 animate-pulse">
      <div className="h-7 md:h-8 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-64" />
    </div>
  )
}
