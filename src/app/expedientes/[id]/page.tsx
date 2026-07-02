'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface ExpedienteDetail {
  id: number
  numero: string
  cliente: { id: number; nombre: string; telefono: string; email: string; direccion: string }
  juzgado: string
  tipo: string
  estatus: string
  partes: any[]
  documentos: any[]
  creado_en: string
  actualizado_en: string
}

export default function ExpedienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const fileInput = useRef<HTMLInputElement>(null)

  const [exp, setExp] = useState<ExpedienteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    api.expedientes.get(id).then(setExp).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.documentos.upload(id, file)
      load()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const badgeClass = (est: string) => {
    switch (est) {
      case 'activo': return 'badge-active'
      case 'concluido': return 'badge-concluido'
      case 'suspendido': return 'badge-suspendido'
      case 'archivado': return 'badge-archivado'
      default: return 'badge'
    }
  }

  if (loading) return <div className="text-center py-20 text-gov-muted">Cargando...</div>
  if (!exp) return <div className="text-center py-20 text-gov-muted">Expediente no encontrado</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/expedientes')} className="text-sm text-gov-muted hover:text-gov-blue mb-1 block">
            ← Volver a expedientes
          </button>
          <h1 className="text-2xl font-bold">{exp.numero}</h1>
        </div>
        <span className={badgeClass(exp.estatus)}>{exp.estatus}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Datos Generales</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gov-muted">Juzgado</dt>
                <dd className="font-medium">{exp.juzgado || '—'}</dd>
              </div>
              <div>
                <dt className="text-gov-muted">Tipo</dt>
                <dd className="font-medium">{exp.tipo || '—'}</dd>
              </div>
              <div>
                <dt className="text-gov-muted">Creado</dt>
                <dd className="font-medium">{new Date(exp.creado_en).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gov-muted">Actualizado</dt>
                <dd className="font-medium">{new Date(exp.actualizado_en).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Partes</h3>
            {exp.partes.length === 0 ? (
              <p className="text-sm text-gov-muted">Sin partes registradas</p>
            ) : (
              <div className="space-y-3">
                {exp.partes.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{p.nombre}</span>
                      {p.representante && (
                        <span className="text-xs text-gov-muted ml-2">— Rep: {p.representante}</span>
                      )}
                    </div>
                    <span className="badge bg-blue-100 text-blue-800 text-xs">{p.tipo_parte}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Documentos</h3>
              <button
                className="btn-secondary text-xs"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : 'Subir PDF'}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
            {exp.documentos.length === 0 ? (
              <p className="text-sm text-gov-muted">Sin documentos</p>
            ) : (
              <ul className="divide-y divide-gov-border">
                {exp.documentos.map((d: any) => (
                  <li key={d.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-medium">{d.nombre}</p>
                        <p className="text-xs text-gov-muted">{new Date(d.subido_en).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href={api.documentos.downloadUrl(d.id)}
                      className="text-sm text-gov-blue hover:underline"
                      target="_blank"
                    >
                      Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Cliente</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{exp.cliente.nombre}</p>
              {exp.cliente.telefono && <p className="text-gov-muted">📞 {exp.cliente.telefono}</p>}
              {exp.cliente.email && <p className="text-gov-muted">✉️ {exp.cliente.email}</p>}
              {exp.cliente.direccion && <p className="text-gov-muted">📍 {exp.cliente.direccion}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
