'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { RoleGate } from '@/components/RoleGate'
import { TableSkeleton } from '@/components/Skeleton'

interface Expediente {
  id: number
  numero: string
  folio: string | null
  cliente_nombre: string
  juzgado: string
  sello?: string
  tipo: string
  estatus: string
  creado_en: string
}

export default function ExpedientesPage() {
  const [items, setItems] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estatus, setEstatus] = useState('')

  const load = () => {
    setLoading(true)
    api.expedientes.list({ search, estatus: estatus || undefined })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, estatus])

  const badgeClass = (est: string) => {
    switch (est) {
      case 'activo': return 'badge-active'
      case 'concluido': return 'badge-concluido'
      case 'suspendido': return 'badge-suspendido'
      case 'archivado': return 'badge-archivado'
      default: return 'badge'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Expedientes</h1>
          <p className="text-gov-muted text-xs md:text-sm mt-0.5">{items.length} registros</p>
        </div>
        <RoleGate role="abogado">
          <Link href="/expedientes/nuevo" className="btn-primary text-sm">+ Nuevo</Link>
        </RoleGate>
      </div>

      <div className="card mb-4 md:mb-6">
        <div className="p-3 md:p-4 flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            className="input-field flex-1"
            placeholder="Buscar por número, cliente o juzgado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field w-full md:w-44"
            value={estatus}
            onChange={(e) => setEstatus(e.target.value)}
          >
            <option value="">Todos los estatus</option>
            <option value="activo">Activo</option>
            <option value="concluido">Concluido</option>
            <option value="suspendido">Suspendido</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gov-muted mb-3 text-sm">No hay expedientes</p>
          <RoleGate role="abogado">
            <Link href="/expedientes/nuevo" className="text-sm text-gov-blue underline">Crear primer expediente</Link>
          </RoleGate>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hide-mobile card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gov-border bg-gray-50">
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">No.</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Folio Interno</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Cliente</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Juzgado</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Sello</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Materia</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Estatus</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Creado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exp) => (
                  <tr key={exp.id} className="border-b border-gov-border hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Link href={`/expedientes/${exp.id}`} className="font-medium text-gov-blue hover:underline text-sm">
                        {exp.numero}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gov-muted">{exp.folio || '-'}</td>
                    <td className="p-4 text-sm">{exp.cliente_nombre}</td>
                    <td className="p-4 text-sm text-gov-muted">{exp.juzgado}</td>
                    <td className="p-4">
                      {exp.sello ? (
                        <span className="badge bg-gov-gold/10 text-gov-gold border border-gov-gold/20">{exp.sello}</span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-gov-muted">{exp.tipo}</td>
                    <td className="p-4">
                      <span className={badgeClass(exp.estatus)}>{exp.estatus}</span>
                    </td>
                    <td className="p-4 text-sm text-gov-muted">
                      {new Date(exp.creado_en).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((exp) => (
              <Link
                key={exp.id}
                href={`/expedientes/${exp.id}`}
                className="block card p-4 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gov-blue">{exp.numero}</span>
                  <span className={badgeClass(exp.estatus)}>{exp.estatus}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gov-muted">Folio</span>
                    <span>{exp.folio || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gov-muted">Cliente</span>
                    <span>{exp.cliente_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gov-muted">Juzgado</span>
                    <span className="text-right">{exp.juzgado || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gov-border pt-2 mt-2">
                    <span className="text-gov-muted">Sello</span>
                    <span className="text-right">
                      {exp.sello ? (
                        <span className="badge bg-gov-gold/10 text-gov-gold border border-gov-gold/20">{exp.sello}</span>
                      ) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gov-border pt-2 mt-2">
                    <span className="text-gov-muted">Materia</span>
                    <span className="text-right">{exp.tipo || '-'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
