# LegalDesk — Sistema de Gestión de Expedientes Legales

Portal web institucional para la gestión de expedientes legales, construido con Next.js 14.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (diseño institucional tipo portal .gob)
- **TypeScript**

## Roles

| Rol | Permisos |
|---|---|
| Admin | CRUD completo, asignar expedientes a usuarios |
| Abogado | CRUD expedientes asignados, subir documentos |
| Consultor | Solo lectura de expedientes compartidos |

## Scripts

```bash
npm run dev    # Desarrollo
npm run build  # Producción
npm start      # Servir build
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend (ej: túnel Cloudflare o ngrok) |

## Funcionalidades

- Login con JWT por roles
- Dashboard con estadísticas
- CRUD de expedientes con búsqueda y filtros
- Asignación de expedientes a usuarios
- Subida y descarga de documentos
- Descarga de expediente como resumen .txt
- Diseño responsive mobile-first
- Notificaciones toast
- Estados de carga con skeletons
