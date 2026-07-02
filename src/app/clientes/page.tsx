'use client'

import { useEffect, useState, FormEvent } from 'react'
import { api } from '@/lib/api'

interface Cliente {
  id: number
  nombre: string
  telefono: string
  email: string
  direccion: string
  notas: string
}

export default function ClientesPage() {
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
      setNewName('')
      setNewPhone('')
      setNewEmail('')
      setShowForm(false)
      load()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gov-muted text-sm mt-1">{items.length} registros</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">Nuevo Cliente</h3>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input className="input-field flex-1" placeholder="Nombre *" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <input className="input-field w-44" placeholder="Teléfono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <input className="input-field w-64" placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button type="submit" className="btn-primary">Guardar</button>
          </form>
        </div>
      )}

      <div className="card mb-6">
        <div className="p-4">
          <input
            className="input-field"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gov-muted">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gov-muted">No hay clientes</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
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
      )}
    </div>
  )
}
