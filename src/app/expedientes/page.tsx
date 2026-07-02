'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Expediente {
  id: number
  numero: string
  cliente_nombre: string
  juzgado: string
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expedientes</h1>
          <p className="text-gov-muted text-sm mt-1">{items.length} registros</p>
        </div>
        <Link href="/expedientes/nuevo" className="btn-primary">+ Nuevo</Link>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Buscar por número, cliente o juzgado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field w-44"
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
        <div className="text-center py-20 text-gov-muted">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gov-muted mb-2">No hay expedientes</p>
          <Link href="/expedientes/nuevo" className="text-sm text-gov-blue underline">Crear primero</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gov-border bg-gray-50">
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">No.</th>
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Cliente</th>
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Juzgado</th>
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Tipo</th>
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Estatus</th>
                <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Creado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((exp) => (
                <tr key={exp.id} className="border-b border-gov-border hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <Link href={`/expedientes/${exp.id}`} className="font-medium text-gov-blue hover:underline">
                      {exp.numero}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{exp.cliente_nombre}</td>
                  <td className="p-4 text-sm text-gov-muted">{exp.juzgado}</td>
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
      )}
    </div>
  )
}
