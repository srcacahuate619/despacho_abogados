'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/Toast'
import { CardSkeleton } from '@/components/Skeleton'
import { RoleGate } from '@/components/RoleGate'
import { isAdmin } from '@/lib/auth'

interface UsuarioInfo {
  id: number
  email: string
  nombre: string
  rol: string
}

interface ExpedienteDetail {
  id: number
  numero: string
  cliente: { id: number; nombre: string; telefono: string; email: string; direccion: string }
  juzgado: string
  tipo: string
  estatus: string
  partes: any[]
  documentos: any[]
  usuarios_asignados: UsuarioInfo[]
  creado_en: string
  actualizado_en: string
}

export default function ExpedienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params.id)
  const fileInput = useRef<HTMLInputElement>(null)

  const [exp, setExp] = useState<ExpedienteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [allUsers, setAllUsers] = useState<UsuarioInfo[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')

  const load = () => {
    api.expedientes.get(id).then(setExp).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (isAdmin()) {
      api.usuarios().then(setAllUsers).catch(() => {})
    }
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.documentos.upload(id, file)
      toast('Documento subido exitosamente', 'success')
      load()
    } catch (err: any) {
      toast(err.message || 'Error al subir documento', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedUserId) return
    try {
      await api.expedientes.asignar(id, Number(selectedUserId))
      toast('Usuario asignado', 'success')
      setSelectedUserId('')
      load()
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  const handleRemove = async (userId: number, name: string) => {
    if (!confirm(`¿Remover acceso de ${name}?`)) return
    try {
      await api.expedientes.remover(id, userId)
      toast('Acceso removido', 'success')
      load()
    } catch (err: any) {
      toast(err.message, 'error')
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

  if (loading) return (
    <div className="space-y-4">
      <div className="animate-pulse h-6 bg-gray-200 rounded w-32 mb-2" />
      <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-6" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )

  if (!exp) return (
    <div className="text-center py-20 text-gov-muted">
      <p className="text-lg mb-2">Expediente no encontrado</p>
      <button onClick={() => router.push('/expedientes')} className="text-sm text-gov-blue underline">
        Volver a expedientes
      </button>
    </div>
  )

  const unassignedUsers = allUsers.filter(
    (u) => !exp.usuarios_asignados.some((a) => a.id === u.id)
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <button onClick={() => router.push('/expedientes')} className="text-xs md:text-sm text-gov-muted hover:text-gov-blue mb-1 block">
            ← Volver a expedientes
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            {exp.numero}
            <a
              href={api.expedientes.downloadUrl(exp.id)}
              className="text-xs btn-secondary py-1 px-2"
              target="_blank"
            >
              ⬇ Descargar
            </a>
          </h1>
        </div>
        <span className={badgeClass(exp.estatus)}>{exp.estatus}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <DetailCard title="Datos Generales">
            <dl className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
              <div>
                <dt className="text-gov-muted text-xs">Juzgado</dt>
                <dd className="font-medium">{exp.juzgado || '—'}</dd>
              </div>
              <div>
                <dt className="text-gov-muted text-xs">Tipo</dt>
                <dd className="font-medium">{exp.tipo || '—'}</dd>
              </div>
              <div>
                <dt className="text-gov-muted text-xs">Creado</dt>
                <dd className="font-medium">{new Date(exp.creado_en).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gov-muted text-xs">Actualizado</dt>
                <dd className="font-medium">{new Date(exp.actualizado_en).toLocaleDateString()}</dd>
              </div>
            </dl>
          </DetailCard>

          <DetailCard title="Partes">
            {exp.partes.length === 0 ? (
              <p className="text-sm text-gov-muted py-2">Sin partes registradas</p>
            ) : (
              <div className="divide-y divide-gov-border">
                {exp.partes.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 mr-2">
                      <span className="font-medium text-sm block truncate">{p.nombre}</span>
                      {p.representante && (
                        <span className="text-xs text-gov-muted">Rep: {p.representante}</span>
                      )}
                    </div>
                    <span className="badge bg-blue-100 text-blue-800 text-xs shrink-0">{p.tipo_parte}</span>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>

          <DetailCard title="Documentos">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gov-muted">{exp.documentos.length} archivos</p>
              <RoleGate role="abogado">
                <button
                  className="btn-secondary text-xs"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : '+ Subir PDF'}
                </button>
              </RoleGate>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
            {exp.documentos.length === 0 ? (
              <p className="text-sm text-gov-muted py-4 text-center">Sin documentos</p>
            ) : (
              <ul className="divide-y divide-gov-border">
                {exp.documentos.map((d: any) => (
                  <li key={d.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.nombre}</p>
                        <p className="text-xs text-gov-muted">{new Date(d.subido_en).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href={api.documentos.downloadUrl(d.id)}
                      className="text-sm text-gov-blue hover:underline shrink-0 ml-2"
                      target="_blank"
                    >
                      Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4 md:space-y-6">
          <DetailCard title="Cliente">
            <div className="space-y-2 text-sm">
              <p className="font-medium">{exp.cliente.nombre}</p>
              {exp.cliente.telefono && <p className="text-gov-muted text-xs">📞 {exp.cliente.telefono}</p>}
              {exp.cliente.email && <p className="text-gov-muted text-xs">✉️ {exp.cliente.email}</p>}
              {exp.cliente.direccion && <p className="text-gov-muted text-xs">📍 {exp.cliente.direccion}</p>}
            </div>
          </DetailCard>

          <DetailCard title="Compartido con">
            {exp.usuarios_asignados.length === 0 ? (
              <p className="text-sm text-gov-muted py-2">Solo visible para ti</p>
            ) : (
              <ul className="space-y-2">
                {exp.usuarios_asignados.map((u) => (
                  <li key={u.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <span className="font-medium block truncate">{u.nombre}</span>
                      <span className="text-xs text-gov-muted capitalize">{u.rol}</span>
                    </div>
                    <RoleGate role="admin">
                      <button
                        onClick={() => handleRemove(u.id, u.nombre)}
                        className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0"
                      >
                        ✕
                      </button>
                    </RoleGate>
                  </li>
                ))}
              </ul>
            )}

            <RoleGate role="admin">
              <div className="mt-4 pt-4 border-t border-gov-border">
                <label className="block text-xs font-medium text-gov-muted mb-2">Asignar usuario</label>
                <div className="flex gap-2">
                  <select
                    className="input-field text-xs flex-1"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.rol})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-primary text-xs py-2"
                    onClick={handleAssign}
                    disabled={!selectedUserId}
                  >
                    +
                  </button>
                </div>
              </div>
            </RoleGate>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gov-border shadow-sm p-4 md:p-6">
      <h3 className="font-semibold text-sm md:text-base mb-4">{title}</h3>
      {children}
    </div>
  )
}
