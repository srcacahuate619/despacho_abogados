'use client'

import { useEffect, useState, FormEvent } from 'react'
import { api } from '@/lib/api'
import { RoleGate } from '@/components/RoleGate'
import { useToast } from '@/components/Toast'
import { TableSkeleton } from '@/components/Skeleton'

interface Cliente {
  id: number
  nombre: string
  telefono: string
  email: string
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const load = () => {
    setLoading(true)
    api.clientes.list(search)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName) return
    try {
      await api.clientes.create({ nombre: newName, telefono: newPhone, email: newEmail })
      toast('Cliente creado exitosamente', 'success')
      setNewName('')
      setNewPhone('')
      setNewEmail('')
      setShowForm(false)
      load()
    } catch (err: any) {
      toast(err.message || 'Error al crear cliente', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Clientes</h1>
          <p className="text-gov-muted text-xs md:text-sm mt-0.5">{items.length} registros</p>
        </div>
        <RoleGate role="abogado">
          <button className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo'}
          </button>
        </RoleGate>
      </div>

      {showForm && (
        <div className="card p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="font-semibold text-sm mb-4">Nuevo Cliente</h3>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-2 md:gap-3">
            <input className="input-field flex-1" placeholder="Nombre *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <input className="input-field w-full md:w-44" placeholder="Teléfono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <input className="input-field w-full md:w-64" placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button type="submit" className="btn-primary">Guardar</button>
          </form>
        </div>
      )}

      <div className="card mb-4 md:mb-6">
        <div className="p-3 md:p-4">
          <input
            className="input-field"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gov-muted text-sm">No hay clientes</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hide-mobile card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gov-border bg-gray-50">
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Nombre</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Teléfono</th>
                  <th className="text-left p-4 text-xs font-medium text-gov-muted uppercase">Email</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-gov-border hover:bg-gray-50">
                    <td className="p-4 font-medium text-sm">{c.nombre}</td>
                    <td className="p-4 text-sm text-gov-muted">{c.telefono || '—'}</td>
                    <td className="p-4 text-sm text-gov-muted">{c.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((c) => (
              <div key={c.id} className="card p-4">
                <p className="font-semibold text-sm mb-2">{c.nombre}</p>
                <div className="space-y-1 text-sm text-gov-muted">
                  <p>📞 {c.telefono || '—'}</p>
                  <p>✉️ {c.email || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
