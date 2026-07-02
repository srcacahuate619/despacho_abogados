const API = process.env.NEXT_PUBLIC_API_URL || ''

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token')
  return null
}

function signedUrl(path: string): string {
  const token = getToken()
  const sep = path.includes('?') ? '&' : '?'
  return `${API}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // If we have FormData, remove Content-Type to let browser set multipart boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${API}${path}`, { ...options, headers })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new Error('No autorizado')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de servidor' }))
    throw new Error(err.detail || 'Error de servidor')
  }

  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json()
  }
  return res
}

export const api = {
  login: (email: string, password: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/api/auth/me'),
  usuarios: () => request('/api/auth/usuarios'),

  expedientes: {
    list: (params?: { search?: string; estatus?: string; page?: number }) => {
      const q = new URLSearchParams()
      if (params?.search) q.set('search', params.search)
      if (params?.estatus) q.set('estatus', params.estatus)
      if (params?.page) q.set('page', String(params.page))
      const qs = q.toString()
      return request(`/api/expedientes${qs ? `?${qs}` : ''}`)
    },
    get: (id: number) => request(`/api/expedientes/${id}`),
    create: (data: any) =>
      request('/api/expedientes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request(`/api/expedientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    usuarios: (id: number) => request(`/api/expedientes/${id}/usuarios`),
    asignar: (id: number, usuarioId: number) =>
      request(`/api/expedientes/${id}/usuarios?usuario_id=${usuarioId}`, { method: 'POST' }),
    remover: (id: number, usuarioId: number) =>
      request(`/api/expedientes/${id}/usuarios/${usuarioId}`, { method: 'DELETE' }),
    downloadUrl: (id: number) => signedUrl(`/api/expedientes/${id}/download`),
    notas: {
      list: (id: number) => request(`/api/expedientes/${id}/notas`),
      create: (id: number, contenido: string) =>
        request(`/api/expedientes/${id}/notas`, { method: 'POST', body: JSON.stringify({ contenido }) }),
    },
    fechas: {
      list: (id: number) => request(`/api/expedientes/${id}/fechas`),
      create: (id: number, data: any) =>
        request(`/api/expedientes/${id}/fechas`, { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: number, fechaId: number) =>
        request(`/api/expedientes/${id}/fechas/${fechaId}`, { method: 'DELETE' }),
    },
    actividades: (id: number) => request(`/api/expedientes/${id}/actividades`),
    vencimientos: () => request('/api/expedientes/proximos/vencimientos'),
  },

  clientes: {
    list: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : ''
      return request(`/api/clientes${q}`)
    },
    create: (data: any) =>
      request('/api/clientes', { method: 'POST', body: JSON.stringify(data) }),
  },

  documentos: {
    list: (expedienteId: number) =>
      request(`/api/documentos/expediente/${expedienteId}`),
    upload: (expedienteId: number, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request(`/api/documentos/expediente/${expedienteId}`, {
        method: 'POST',
        body: form,
      })
    },
    downloadUrl: (id: number) => signedUrl(`/api/documentos/${id}/descargar`),
  },

  dashboard: {
    resumen: () => request('/api/dashboard/resumen'),
  },
}
