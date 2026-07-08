'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/Toast'
import { CardSkeleton } from '@/components/Skeleton'
import { RoleGate } from '@/components/RoleGate'
import { isAdmin, getUser } from '@/lib/auth'
import { Download, X, FileText, Phone, Mail, MapPin, Plus, Calendar, MessageSquareText } from 'lucide-react'

interface Detail {
  id: number; numero: string;  folio?: string; sello?: string; cliente: { id: number; nombre: string; email: string; telefono: string }
  juzgado: string; tipo: string; estatus: string
  partes: any[]; documentos: any[]; usuarios_asignados: any[]
  creado_en: string; actualizado_en: string
}

interface Nota { id: number; contenido: string; usuario_nombre: string; creado_en: string }
interface Fecha { id: number; tipo: string; fecha: string; descripcion: string }
interface Actividad { id: number; tipo: string; descripcion: string; usuario_nombre: string; creado_en: string }
interface UserInfo { id: number; email: string; nombre: string; rol: string }

export default function ExpedienteDetailPage() {
  const params = useParams(); const router = useRouter(); const { toast } = useToast()
  const id = Number(params.id); const fileInput = useRef<HTMLInputElement>(null)
  const user = getUser()

  const [exp, setExp] = useState<Detail | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [fechas, setFechas] = useState<Fecha[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [allUsers, setAllUsers] = useState<UserInfo[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [notaText, setNotaText] = useState('')
  const [addingNota, setAddingNota] = useState(false)
  const [fechaForm, setFechaForm] = useState({ tipo: 'audiencia', fecha: '', descripcion: '' })

  const load = () => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.expedientes.get(id),
      api.expedientes.notas.list(id),
      api.expedientes.fechas.list(id),
      api.expedientes.actividades(id),
    ]).then(([e, n, f, a]) => {
      setExp(e); setNotas(n); setFechas(f); setActividades(a)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { if (id) load() }, [id])
  useEffect(() => { if (isAdmin()) api.usuarios().then(setAllUsers).catch(() => {}) }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { await api.documentos.upload(id, file); toast('Documento subido', 'success'); load() }
    catch (err: any) { toast(err.message, 'error') }
    finally { setUploading(false) }
  }

  const handleAssign = async () => {
    if (!selectedUserId) return
    try { await api.expedientes.asignar(id, Number(selectedUserId)); toast('Usuario asignado', 'success'); setSelectedUserId(''); load() }
    catch (err: any) { toast(err.message, 'error') }
  }

  const handleRemove = async (userId: number, name: string) => {
    if (!confirm(`¿Remover acceso de ${name}?`)) return
    try { await api.expedientes.remover(id, userId); toast('Acceso removido', 'success'); load() }
    catch (err: any) { toast(err.message, 'error') }
  }

  const addNota = async (e: FormEvent) => {
    e.preventDefault(); if (!notaText.trim()) return
    setAddingNota(true)
    try { await api.expedientes.notas.create(id, notaText); setNotaText(''); toast('Nota agregada', 'success'); load() }
    catch (err: any) { toast(err.message, 'error') }
    finally { setAddingNota(false) }
  }

  const addFecha = async (e: FormEvent) => {
    e.preventDefault(); if (!fechaForm.fecha) return
    try {
      await api.expedientes.fechas.create(id, fechaForm)
      setFechaForm({ tipo: 'audiencia', fecha: '', descripcion: '' })
      toast('Fecha registrada', 'success'); load()
    } catch (err: any) { toast(err.message, 'error') }
  }

  const delFecha = async (fid: number) => {
    if (!confirm('¿Eliminar esta fecha?')) return
    try { await api.expedientes.fechas.delete(id, fid); toast('Fecha eliminada', 'success'); load() }
    catch (err: any) { toast(err.message, 'error') }
  }

  const badgeClass = (est: string) => {
    const m: Record<string, string> = { activo: 'badge-active', concluido: 'badge-concluido', suspendido: 'badge-suspendido', archivado: 'badge-archivado' }
    return m[est] || 'badge'
  }

  const fechaBadge = (t: string) => {
    const colors: Record<string, string> = { audiencia: 'bg-blue-100 text-blue-800', vencimiento: 'bg-red-100 text-red-800', prescripcion: 'bg-yellow-100 text-yellow-800', otro: 'bg-gray-100 text-gray-800' }
    return colors[t] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="space-y-4"><div className="animate-pulse h-6 bg-gray-200 rounded w-32 mb-2" /><div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-6" /><CardSkeleton /><CardSkeleton /></div>
  if (!exp) return <div className="text-center py-20 text-gov-muted"><p className="text-lg mb-2">Expediente no encontrado</p><button onClick={() => router.push('/expedientes')} className="text-sm text-gov-blue underline">Volver</button></div>

  const unassignedUsers = allUsers.filter((u) => !exp.usuarios_asignados.some((a: any) => a.id === u.id))

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <button onClick={() => router.push('/expedientes')} className="text-xs md:text-sm text-gov-muted hover:text-gov-blue mb-1 block">← Volver</button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{exp.numero}</h2>
            {exp.sello && (
              <span className="badge bg-gov-gold/10 text-gov-gold border border-gov-gold/20 px-3 py-1 text-sm font-semibold">{exp.sello}</span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              exp.estatus === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>{exp.estatus}</span>
          </div>
          <p className="text-gov-muted mt-1">{exp.cliente.nombre}</p>
        </div>
        <a href={api.expedientes.downloadUrl(exp.id)} className="text-xs btn-secondary py-1 px-2 inline-flex items-center gap-1" target="_blank"><Download className="w-3 h-3" /> Descargar PDF</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* DATOS GENERALES */}
          <Section title="Datos Generales">
            <dl className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
              <div><dt className="text-gov-muted text-xs">Folio Interno</dt><dd className="font-medium">{exp.folio || '—'}</dd></div>
              <div><dt className="text-gov-muted text-xs">Juzgado</dt><dd className="font-medium">{exp.juzgado || '-'}</dd></div>
              <div><dt className="text-gov-muted text-xs">Materia</dt><dd className="font-medium">{exp.tipo || '-'}</dd></div>
              <div><dt className="text-gov-muted text-xs">Creado</dt><dd className="font-medium">{new Date(exp.creado_en).toLocaleDateString()}</dd></div>
              <div><dt className="text-gov-muted text-xs">Actualizado</dt><dd className="font-medium">{new Date(exp.actualizado_en).toLocaleDateString()}</dd></div>
            </dl>
          </Section>

          {/* PARTES */}
          <Section title="Partes">
            {exp.partes.length === 0 ? <p className="text-sm text-gov-muted py-2">Sin partes registradas</p> : (
              <div className="divide-y divide-gov-border">
                {exp.partes.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 mr-2">
                      <span className="font-medium text-sm block truncate">{p.nombre}</span>
                      {p.representante && <span className="text-xs text-gov-muted">Rep: {p.representante}</span>}
                    </div>
                    <span className="badge bg-blue-100 text-blue-800 text-xs shrink-0">{p.tipo_parte}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* FECHAS CLAVE */}
          <Section title="Fechas Clave">
            {fechas.length === 0 ? <p className="text-sm text-gov-muted py-2">Sin fechas registradas</p> : (
              <div className="space-y-2">
                {fechas.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium shrink-0">{new Date(f.fecha).toLocaleDateString()}</span>
                      <span className={`badge text-xs ${fechaBadge(f.tipo)}`}>{f.tipo}</span>
                      <span className="text-sm text-gov-muted truncate">{f.descripcion || ''}</span>
                    </div>
                    <RoleGate role="admin"><button onClick={() => delFecha(f.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0 ml-2"><X className="w-3 h-3" /></button></RoleGate>
                  </div>
                ))}
              </div>
            )}
            <RoleGate role="abogado">
              <form onSubmit={addFecha} className="mt-4 pt-4 border-t border-gov-border">
                <p className="text-xs font-medium text-gov-muted mb-2">Agregar fecha clave</p>
                <div className="flex flex-wrap gap-2">
                  <select className="input-field text-xs w-36" value={fechaForm.tipo} onChange={(e) => setFechaForm({ ...fechaForm, tipo: e.target.value })}>
                    <option value="audiencia">Audiencia</option>
                    <option value="vencimiento">Vencimiento</option>
                    <option value="prescripcion">Prescripción</option>
                    <option value="otro">Otro</option>
                  </select>
                  <input type="date" className="input-field text-xs w-40" value={fechaForm.fecha} onChange={(e) => setFechaForm({ ...fechaForm, fecha: e.target.value })} required />
                  <input className="input-field text-xs flex-1 min-w-[120px]" placeholder="Descripción" value={fechaForm.descripcion} onChange={(e) => setFechaForm({ ...fechaForm, descripcion: e.target.value })} />
                  <button type="submit" className="btn-primary text-xs py-2">Agregar</button>
                </div>
              </form>
            </RoleGate>
          </Section>

          {/* NOTAS */}
          <Section title="Notas">
            <div className="space-y-3 mb-4">
              {notas.length === 0 ? <p className="text-sm text-gov-muted py-2">Sin notas</p> : (
                notas.map((n) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{n.usuario_nombre}</span>
                      <span className="text-xs text-gov-muted">{new Date(n.creado_en).toLocaleString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{n.contenido}</p>
                  </div>
                ))
              )}
            </div>
            <RoleGate role="abogado">
              <form onSubmit={addNota}>
                <textarea className="input-field text-sm min-h-[80px] mb-2" placeholder="Escribe una nota..." value={notaText} onChange={(e) => setNotaText(e.target.value)} />
                <button type="submit" className="btn-primary text-xs" disabled={addingNota || !notaText.trim()}>{addingNota ? 'Guardando...' : 'Agregar nota'}</button>
              </form>
            </RoleGate>
          </Section>

          {/* DOCUMENTOS */}
          <Section title="Documentos">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gov-muted">{exp.documentos.length} archivos</p>
              <RoleGate role="abogado"><button className="btn-secondary text-xs" onClick={() => fileInput.current?.click()} disabled={uploading}>{uploading ? 'Subiendo...' : '+ Subir PDF'}</button></RoleGate>
              <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleUpload} />
            </div>
            {exp.documentos.length === 0 ? <p className="text-sm text-gov-muted py-4 text-center">Sin documentos</p> : (
              <ul className="divide-y divide-gov-border">
                {exp.documentos.map((d: any) => (
                  <li key={d.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 shrink-0 text-gov-muted" />
                      <div className="min-w-0"><p className="text-sm font-medium truncate">{d.nombre}</p><p className="text-xs text-gov-muted">{new Date(d.subido_en).toLocaleDateString()}</p></div>
                    </div>
                    <a href={api.documentos.downloadUrl(d.id)} className="text-sm text-gov-blue hover:underline shrink-0 ml-2" target="_blank">Descargar</a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* TIMELINE */}
          <Section title="Actividad Reciente">
            {actividades.length === 0 ? <p className="text-sm text-gov-muted py-2">Sin actividad registrada</p> : (
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-200" />
                {actividades.slice(0, 20).map((a) => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-gov-blue border-2 border-white" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm">{a.descripcion}</p>
                        <p className="text-xs text-gov-muted">{a.usuario_nombre}</p>
                      </div>
                      <span className="text-xs text-gov-muted shrink-0">{new Date(a.creado_en).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 md:space-y-6">
          <Section title="Cliente">
            <div className="space-y-2 text-sm">
              <p className="font-medium">{exp.cliente.nombre}</p>
              {exp.cliente.telefono && <p className="text-gov-muted text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> {exp.cliente.telefono}</p>}
              {exp.cliente.email && <p className="text-gov-muted text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {exp.cliente.email}</p>}
              {exp.cliente.direccion && <p className="text-gov-muted text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.cliente.direccion}</p>}
            </div>
          </Section>

          <Section title="Compartido con">
            {exp.usuarios_asignados.length === 0 ? <p className="text-sm text-gov-muted py-2">Solo visible para ti</p> : (
              <ul className="space-y-2">
                {exp.usuarios_asignados.map((u: any) => (
                  <li key={u.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <span className="font-medium block truncate">{u.nombre}</span>
                      <span className="text-xs text-gov-muted capitalize">{u.rol}</span>
                    </div>
                    <RoleGate role="admin"><button onClick={() => handleRemove(u.id, u.nombre)} className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0"><X className="w-3 h-3" /></button></RoleGate>
                  </li>
                ))}
              </ul>
            )}
            <RoleGate role="admin">
              <div className="mt-4 pt-4 border-t border-gov-border">
                <label className="block text-xs font-medium text-gov-muted mb-2">Asignar usuario</label>
                <div className="flex gap-2">
                  <select className="input-field text-xs flex-1" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {unassignedUsers.map((u) => (<option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>))}
                  </select>
                  <button className="btn-primary text-xs py-2" onClick={handleAssign} disabled={!selectedUserId}>+</button>
                </div>
              </div>
            </RoleGate>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gov-border shadow-sm p-4 md:p-6"><h3 className="font-semibold text-sm md:text-base mb-4">{title}</h3>{children}</div>
}
