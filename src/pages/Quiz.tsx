import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { quizQuestions, careers } from '../data/careers'

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)

  const progress = ((current + 1) / quizQuestions.length) * 100

  function selectOption(optionIndex: number) {
    const updated = [...answers]
    updated[current] = optionIndex
    setAnswers(updated)

    if (current < quizQuestions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    } else {
      setTimeout(() => setShowResults(true), 300)
    }
  }

  function getResults() {
    const scores: Record<string, number> = {}
    answers.forEach((optionIndex, questionIndex) => {
      const question = quizQuestions[questionIndex]
      if (question && optionIndex !== undefined) {
        const option = question.options[optionIndex]
        option.categories.forEach((cat) => {
          scores[cat] = (scores[cat] || 0) + 1
        })
      }
    })

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const topCategories = sorted.slice(0, 2).map(([cat]) => cat)

    return careers.filter((c) => topCategories.includes(c.category))
  }

  function restart() {
    setCurrent(0)
    setAnswers([])
    setShowResults(false)
  }

  if (showResults) {
    const results = getResults()
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Career Matches</h1>
          <p className="mt-3 text-gray-600">
            Based on your responses, here are the careers that best match your interests and strengths.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {results.map((career) => (
            <div
              key={career.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{career.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm text-primary-600">{career.category}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{career.description}</p>
              <p className="mt-2 text-sm font-medium text-accent-600">{career.avgSalary}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </button>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Explore All Careers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const question = quizQuestions[current]

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Career Quiz</h1>
        <p className="mt-2 text-gray-600">
          Answer {quizQuestions.length} quick questions to find your ideal career path.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Question {current + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">{question.question}</h2>
        <div className="mt-6 space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => selectOption(idx)}
              className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all
                ${answers[current] === idx
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50/50'
                }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>
        {answers[current] !== undefined && current < quizQuestions.length - 1 && (
          <button
            onClick={() => setCurrent(current + 1)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
