import { Target, Heart, Lightbulb, Mail, MapPin, Phone } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'To empower every student and professional with the knowledge and tools they need to make confident career decisions and achieve their professional goals.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description:
      'We believe in accessibility, evidence-based guidance, and personalized support. Career guidance should be available to everyone, regardless of background.',
  },
  {
    icon: Lightbulb,
    title: 'Our Approach',
    description:
      'We combine career data, skill assessments, and structured pathways to give you a clear, actionable plan — not just information, but direction.',
  },
]

const team = [
  { name: 'Abhishek Vangala', role: 'Founder & Developer', initials: 'AV' },
  { name: 'Career Experts', role: 'Content & Guidance', initials: 'CE' },
  { name: 'Community', role: 'Mentors & Contributors', initials: 'CM' },
]

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">About CareerPathway</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          We're building the most helpful career guidance platform for students and young
          professionals navigating their future.
        </p>
      </div>

      {/* Values */}
      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {values.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
        <p className="mt-2 text-gray-600">The people behind CareerPathway</p>
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          {team.map(({ name, role, initials }) => (
            <div key={name} className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xl font-bold">
                {initials}
              </div>
              <p className="mt-3 font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-500">{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-20">
        <div className="rounded-2xl bg-gray-50 p-8 sm:p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
            <p className="mt-2 text-gray-600">Have questions or want to collaborate? We'd love to hear from you.</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Mail className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">hello@careerpathway.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-500">Remote / Global</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Phone className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Support</p>
                <p className="text-sm text-gray-500">Available 9am - 6pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
