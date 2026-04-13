import { CheckCircle2, Circle, Clock, BookOpen, Award } from 'lucide-react'

interface Step {
  title: string
  description: string
  duration: string
  done?: boolean
}

interface Pathway {
  title: string
  icon: string
  color: string
  steps: Step[]
}

const pathways: Pathway[] = [
  {
    title: 'Software Engineer',
    icon: '💻',
    color: 'primary',
    steps: [
      { title: 'Learn Programming Fundamentals', description: 'Start with Python or JavaScript. Master variables, loops, functions, and data structures.', duration: '2-3 months', done: true },
      { title: 'Build Projects', description: 'Create portfolio projects — a calculator, to-do app, and personal website.', duration: '2-4 months', done: true },
      { title: 'Learn Data Structures & Algorithms', description: 'Study arrays, trees, graphs, sorting, and dynamic programming.', duration: '3-4 months' },
      { title: 'Choose a Specialization', description: 'Web development, mobile apps, backend systems, or cloud engineering.', duration: '1-2 months' },
      { title: 'Get Certified / Degree', description: "Pursue a CS degree, bootcamp, or industry certifications.", duration: '6-48 months' },
      { title: 'Internship / First Job', description: 'Apply for entry-level positions and internships. Build real-world experience.', duration: '3-6 months' },
    ],
  },
  {
    title: 'Data Scientist',
    icon: '📊',
    color: 'accent',
    steps: [
      { title: 'Learn Python & Statistics', description: 'Master Python programming and statistical concepts like distributions and hypothesis testing.', duration: '2-3 months' },
      { title: 'Study Machine Learning', description: 'Learn supervised/unsupervised learning, regression, classification, and clustering.', duration: '3-4 months' },
      { title: 'Master Data Tools', description: 'Get proficient with Pandas, NumPy, Scikit-learn, and SQL databases.', duration: '2-3 months' },
      { title: 'Build a Portfolio', description: 'Complete Kaggle competitions and create end-to-end data projects.', duration: '2-4 months' },
      { title: 'Advanced Topics', description: 'Deep learning, NLP, computer vision, or big data technologies.', duration: '3-6 months' },
      { title: 'Land Your First Role', description: 'Apply for data analyst or junior data scientist positions.', duration: '2-4 months' },
    ],
  },
  {
    title: 'UX Designer',
    icon: '🎨',
    color: 'primary',
    steps: [
      { title: 'Learn Design Fundamentals', description: 'Study color theory, typography, layout principles, and visual hierarchy.', duration: '1-2 months' },
      { title: 'Master Design Tools', description: 'Learn Figma, Sketch, or Adobe XD for wireframing and prototyping.', duration: '2-3 months' },
      { title: 'Study UX Research', description: 'Learn user interviews, surveys, usability testing, and persona creation.', duration: '2-3 months' },
      { title: 'Build Case Studies', description: 'Design 3-5 detailed case studies showcasing your process from research to solution.', duration: '3-4 months' },
      { title: 'Get Certified', description: 'Complete Google UX Design Certificate or similar programs.', duration: '3-6 months' },
      { title: 'Apply for Roles', description: 'Target junior UX designer or product designer positions.', duration: '2-4 months' },
    ],
  },
  {
    title: 'Registered Nurse',
    icon: '🏥',
    color: 'accent',
    steps: [
      { title: 'Prerequisites', description: 'Complete courses in biology, chemistry, anatomy, and physiology.', duration: '1-2 years' },
      { title: 'Nursing Program', description: 'Complete an accredited BSN (Bachelor of Science in Nursing) program.', duration: '2-4 years' },
      { title: 'Clinical Rotations', description: 'Gain hands-on experience in hospitals across different specialties.', duration: '1-2 years' },
      { title: 'NCLEX Exam', description: 'Pass the National Council Licensure Examination for Registered Nurses.', duration: '1-3 months' },
      { title: 'Choose a Specialty', description: 'Pediatrics, emergency, oncology, surgical, or community health nursing.', duration: '1-2 years' },
      { title: 'Start Your Career', description: 'Apply for RN positions at hospitals, clinics, or home health agencies.', duration: '1-3 months' },
    ],
  },
]

export default function Pathways() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Career Pathways</h1>
        <p className="mt-3 text-lg text-gray-600">
          Step-by-step roadmaps to help you navigate from beginner to professional.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {pathways.map((pathway) => (
          <div key={pathway.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">{pathway.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{pathway.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{pathway.steps.length} steps</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100 sm:left-[19px]" />

              <div className="space-y-6">
                {pathway.steps.map((step, idx) => (
                  <div key={idx} className="relative flex gap-4 sm:gap-6">
                    <div className="relative z-10 mt-0.5 flex-shrink-0">
                      {step.done ? (
                        <CheckCircle2 className="h-8 w-8 text-accent-500 sm:h-10 sm:w-10" />
                      ) : (
                        <Circle className="h-8 w-8 text-gray-300 sm:h-10 sm:w-10" />
                      )}
                    </div>
                    <div className="flex-1 rounded-xl bg-gray-50 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <Clock className="h-3 w-3" />
                          {step.duration}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-xl bg-primary-50 p-4">
              <Award className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-primary-800">Career Ready!</p>
                <p className="text-xs text-primary-600">Complete all steps to be prepared for entry-level positions.</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-6 py-4">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <p className="text-sm text-gray-700">
            More pathways coming soon! We're adding roadmaps for 20+ careers.
          </p>
        </div>
      </div>
    </div>
  )
}
