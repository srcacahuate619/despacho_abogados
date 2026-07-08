'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/Toast'

export default function NuevoExpedientePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    numero: '',
    folio: '',
    cliente_id: '',
    sello: 'Judicial',
    juzgado: '',
    tipo: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.numero || !form.cliente_id) {
      setError('Número y Cliente son obligatorios')
      return
    }
    if (isNaN(Number(form.cliente_id))) {
      setError('El ID del cliente debe ser un número')
      return
    }
    setSaving(true)
    try {
      const exp = await api.expedientes.create({
        ...form,
        cliente_id: Number(form.cliente_id),
        partes: [],
      })
      toast('Expediente creado exitosamente', 'success')
      router.push(`/expedientes/${exp.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/expedientes')} className="text-xs md:text-sm text-gov-muted hover:text-gov-blue mb-4 block">
        ← Volver
      </button>
      <h1 className="text-xl md:text-2xl font-bold mb-6">Nuevo Expediente</h1>

      <div className="card p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Número de Expediente *</label>
            <input
              className="input-field"
              placeholder="Ej: EXP-006"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Folio Interno (Opcional)</label>
            <input
              className="input-field"
              placeholder="Ej: FOL-2026-01"
              value={form.folio}
              onChange={(e) => setForm({ ...form, folio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">ID del Cliente *</label>
            <input
              type="number"
              className="input-field"
              placeholder="Ej: 1"
              value={form.cliente_id}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              required
              min="1"
            />
            <p className="text-xs text-gov-muted mt-1">Revisa la lista de clientes para obtener el ID</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Juzgado</label>
            <input
              className="input-field"
              placeholder="Ej: 3° Civil, Toluca"
              value={form.juzgado}
              onChange={(e) => setForm({ ...form, juzgado: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Materia</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                placeholder="Ej. Civil, Penal, Mercantil..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Sello (Clasificación)</label>
              <select 
                className="input-field" 
                value={form.sello}
                onChange={(e) => setForm({ ...form, sello: e.target.value })}
              >
                <option value="Judicial">Judicial</option>
                <option value="Extrajudicial">Extrajudicial</option>
                <option value="Notaría">Notaría</option>
                <option value="Internos">Internos</option>
                <option value="Particulares">Particulares</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear Expediente'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => router.push('/expedientes')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
