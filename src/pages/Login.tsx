import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateStudentJoiningCode } from '../lib/supabase'
import AnimatedCharacter from '../components/AnimatedCharacter'

export default function Login() {
  const navigate = useNavigate()
  const [joiningCode, setJoiningCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!joiningCode.trim()) {
      setError('Please enter your joining code.')
      return
    }
    setLoading(true)
    try {
      const student = await validateStudentJoiningCode(joiningCode.trim())
      if (!student) {
        setError('Invalid joining code. Please check with your teacher.')
        setLoading(false)
        return
      }
      const session = {
        id: student.id,
        name: student.name,
        class: student.class,
        joining_code: student.joining_code,
        school_code: student.school_code
      }
      localStorage.setItem('student_session', JSON.stringify(session))
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex justify-center mb-2">
          <AnimatedCharacter size={140} />
        </div>
        <h1 className="text-2xl font-black text-center text-indigo-700 mb-1">
          English Buddy
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">
          Learn spoken English — one day at a time!
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Your Joining Code
            </label>
            <input
              type="text"
              value={joiningCode}
              onChange={e => setJoiningCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl font-black tracking-widest uppercase text-center focus:outline-none focus:border-indigo-500 transition"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={6}
            />
            <p className="text-xs text-gray-400 mt-1 text-center">Ask your teacher for your personal code</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-lg rounded-xl py-4 mt-2 transition-all shadow-lg disabled:opacity-60 touch-target"
          >
            {loading ? 'Checking...' : 'Start Learning! 🚀'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/admin"
            className="text-xs text-gray-400 hover:text-indigo-600 transition"
          >
            Teacher? Login here
          </a>
        </div>
      </div>
    </div>
  )
}
