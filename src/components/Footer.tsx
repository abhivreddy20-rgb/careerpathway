import { Link } from 'react-router-dom'
import { Compass, Globe, MessageCircle, Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <Compass className="h-6 w-6" />
              CareerPathway
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Helping students and professionals navigate their career journey with
              confidence through exploration, assessments, and guided pathways.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/careers" className="hover:text-white transition-colors">Career Explorer</Link></li>
              <li><Link to="/quiz" className="hover:text-white transition-colors">Career Quiz</Link></li>
              <li><Link to="/pathways" className="hover:text-white transition-colors">Learning Pathways</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700 transition-colors" aria-label="Social">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700 transition-colors" aria-label="Community">
                <Users className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700 transition-colors" aria-label="Website">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} CareerPathway. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
