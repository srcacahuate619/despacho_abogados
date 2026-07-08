'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { CardSkeleton } from '@/components/Skeleton'
import { RoleGate } from '@/components/RoleGate'
import { CalendarClock, BarChart3, Activity, FolderKanban, Plus, Users } from 'lucide-react'

interface DashboardData {
  total_expedientes: number; activos: number; concluidos: number; suspendidos: number
  total_clientes: number; total_documentos: number
  casos_por_tipo: { tipo: string; count: number }[]
  ultimos_movimientos: any[]
  proximos_vencimientos: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.resumen().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <div className="mb-6 md:mb-8 animate-pulse"><div className="h-7 md:h-8 bg-gray-200 rounded w-48 mb-2" /><div className="h-4 bg-gray-200 rounded w-64" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
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

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 md:p-6 hover:border-gov-gold/50 transition-colors">
            <p className="text-xs md:text-sm text-gov-muted">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* PRÓXIMOS VENCIMIENTOS */}
        <div className="card p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base mb-4 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-gov-gold" /> Próximos Vencimientos</h3>
          {data?.proximos_vencimientos?.length ? (
            <div className="space-y-3">
              {data.proximos_vencimientos.map((v: any, i: number) => (
                <Link key={i} href={`/expedientes/${v.expediente_id}`} className="flex items-center justify-between p-3 rounded-lg border border-gov-border hover:bg-gray-800 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.expediente_numero}</p>
                    <p className="text-xs text-gov-muted truncate">{v.descripcion || v.tipo}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-semibold" style={{ color: v.dias_restantes <= 7 ? '#dc2626' : '#D4AF37' }}>
                      {v.dias_restantes} días
                    </p>
                    <p className="text-xs text-gov-muted">{new Date(v.fecha).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-gov-muted py-4 text-center">Sin próximos vencimientos</p>}
        </div>

        {/* CASOS POR MATERIA */}
        <div className="card p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gov-gold" /> Casos por Materia</h3>
          {data?.casos_por_tipo?.length ? (
            <div className="grid grid-cols-2 gap-4">
              {data.casos_por_tipo.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg border border-gov-border">
                  <span className="text-sm font-medium">{t.tipo}</span>
                  <span className="text-xs font-bold text-black bg-gov-gold rounded-full px-2 py-0.5 min-w-[24px] text-center">
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gov-muted py-4 text-center">Sin datos</p>}
        </div>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div className="card p-4 md:p-6">
          <h3 className="font-semibold text-sm md:text-base mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-gov-gold" /> Actividad Reciente</h3>
        {data?.ultimos_movimientos?.length ? (
          <div className="divide-y divide-gov-border">
            {data.ultimos_movimientos.map((m: any, i: number) => (
              <div key={i} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm truncate">{m.descripcion}</p>
                  <p className="text-xs text-gov-muted">{m.expediente_numero}</p>
                </div>
                <span className="text-xs text-gov-muted shrink-0">{new Date(m.creado_en).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gov-muted py-4 text-center">Sin actividad reciente</p>}
      </div>

      {/* ACCESO RÁPIDO */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/expedientes" className="card p-4 hover:bg-gray-800 transition-colors block border-gov-border">
          <span className="font-medium text-sm flex items-center gap-2 text-gov-gold"><FolderKanban className="w-4 h-4" /> Ver Expedientes</span>
          <p className="text-xs text-gov-muted mt-0.5">Lista completa</p>
        </Link>
        <RoleGate role="abogado">
          <Link href="/expedientes/nuevo" className="card p-4 hover:bg-gray-800 transition-colors block border-gov-border">
            <span className="font-medium text-sm flex items-center gap-2 text-gov-gold"><Plus className="w-4 h-4" /> Nuevo Expediente</span>
            <p className="text-xs text-gov-muted mt-0.5">Registrar un caso</p>
          </Link>
        </RoleGate>
        <Link href="/clientes" className="card p-4 hover:bg-gray-800 transition-colors block border-gov-border">
          <span className="font-medium text-sm flex items-center gap-2 text-gov-gold"><Users className="w-4 h-4" /> Clientes</span>
          <p className="text-xs text-gov-muted mt-0.5">Directorio</p>
        </Link>
      </div>
    </div>
  )
}
