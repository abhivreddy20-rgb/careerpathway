import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-primary-600">404</h1>
      <p className="mt-4 text-xl font-semibold text-gray-900">Page Not Found</p>
      <p className="mt-2 text-gray-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  )
}
