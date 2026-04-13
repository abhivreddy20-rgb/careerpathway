import { useState } from 'react'
import { Search, TrendingUp, GraduationCap, DollarSign } from 'lucide-react'
import { careers, categories } from '../data/careers'

export default function Careers() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = careers.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Explore Careers</h1>
        <p className="mt-3 text-lg text-gray-600">
          Discover careers across industries with salary data, growth outlook, and required skills.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search careers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-shadow"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
                ${activeCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((career) => (
          <div
            key={career.id}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{career.icon}</span>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                {career.category}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{career.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{career.description}</p>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="h-4 w-4 text-accent-500" />
                <span>{career.avgSalary}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 text-accent-500" />
                <span>{career.growth} projected growth</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <GraduationCap className="h-4 w-4 text-primary-500" />
                <span>{career.education}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {career.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-500">No careers found matching your criteria.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All') }}
            className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
