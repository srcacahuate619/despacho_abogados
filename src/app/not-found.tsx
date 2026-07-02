import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gov-blue mb-4">404</h1>
        <p className="text-lg text-gov-muted mb-6">Página no encontrada</p>
        <Link href="/dashboard" className="btn-primary inline-block">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
