import { Link } from 'react-router-dom'
import {
  Compass,
  ClipboardCheck,
  Route,
  Users,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Target,
} from 'lucide-react'

const features = [
  {
    icon: Compass,
    title: 'Explore Careers',
    description: 'Browse 100+ career profiles with salary data, growth trends, and skill requirements.',
    link: '/careers',
  },
  {
    icon: ClipboardCheck,
    title: 'Career Quiz',
    description: 'Take our assessment to discover careers that match your interests and strengths.',
    link: '/quiz',
  },
  {
    icon: Route,
    title: 'Learning Pathways',
    description: 'Follow step-by-step roadmaps from where you are to where you want to be.',
    link: '/pathways',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with mentors and peers who share your career interests.',
    link: '/about',
  },
]

const stats = [
  { value: '50+', label: 'Career Profiles', icon: Target },
  { value: '10K+', label: 'Students Guided', icon: Users },
  { value: '95%', label: 'Satisfaction Rate', icon: TrendingUp },
  { value: '200+', label: 'Learning Resources', icon: BookOpen },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Navigate Your Future
              <span className="block text-primary-200">With Confidence</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-primary-100 sm:text-xl">
              Discover the career that's right for you. Explore industries, take
              personalized assessments, and follow guided pathways to your dream job.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-colors"
              >
                Take the Career Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Explore Careers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-xl sm:grid-cols-4 sm:p-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto h-6 w-6 text-primary-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything You Need to Find Your Path
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful tools and resources designed to guide your career journey
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, link }) => (
            <Link
              key={title}
              to={link}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to Discover Your Ideal Career?
            </h2>
            <p className="mt-4 text-primary-100">
              Our 5-minute quiz will match you with careers that fit your personality, skills, and goals.
            </p>
            <Link
              to="/quiz"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-colors"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
