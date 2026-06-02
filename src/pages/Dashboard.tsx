import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChaptersForSchool, getProgressForStudent } from '../lib/supabase'
import { StudentSession, Chapter, Progress, ChapterWithProgress } from '../types'
import DayCard from '../components/DayCard'
import AnimatedCharacter from '../components/AnimatedCharacter'

const REQUIRED_REVISIONS = 10

function computeUnlocked(
  chapters: Chapter[],
  progressList: Progress[]
): ChapterWithProgress[] {
  const progressMap = new Map<string, Progress>()
  for (const p of progressList) {
    progressMap.set(p.chapter_id, p)
  }

  return chapters.map((chapter, idx) => {
    const progress = progressMap.get(chapter.id) ?? null
    let isUnlocked = false

    if (idx === 0) {
      isUnlocked = true
    } else {
      const prevChapter = chapters[idx - 1]
      const prevProgress = progressMap.get(prevChapter.id)
      if (prevProgress && prevProgress.revision_count >= REQUIRED_REVISIONS) {
        const lastRevised = prevProgress.last_revised_at
          ? new Date(prevProgress.last_revised_at)
          : null
        const today = new Date()
        // Next day unlocks if completed on a previous date
        if (lastRevised) {
          const lastDate = lastRevised.toDateString()
          const todayDate = today.toDateString()
          isUnlocked = lastDate !== todayDate
        }
      }
    }

    return { ...chapter, progress, isUnlocked }
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [chapters, setChapters] = useState<ChapterWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('student_session')
    if (!raw) {
      navigate('/')
      return
    }
    const s: StudentSession = JSON.parse(raw)
    setSession(s)
    loadData(s)
  }, [navigate])

  async function loadData(s: StudentSession) {
    try {
      setLoading(true)
      const [chapterList, progressList] = await Promise.all([
        getChaptersForSchool(s.joining_code),
        getProgressForStudent(s.id)
      ])
      const withProgress = computeUnlocked(chapterList, progressList)
      setChapters(withProgress)
    } catch (err) {
      setError('Failed to load chapters. Please check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('student_session')
    navigate('/')
  }

  const completedDays = chapters.filter(c => (c.progress?.revision_count ?? 0) >= REQUIRED_REVISIONS).length
  const totalDays = chapters.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-black text-lg leading-tight">
            Hi, {session?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 text-xs">{session?.class}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-indigo-200 hover:text-white text-sm font-bold px-3 py-2 rounded-lg hover:bg-indigo-700 transition touch-target"
        >
          Logout
        </button>
      </header>

      {/* Stats bar */}
      {!loading && totalDays > 0 && (
        <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-100 shadow-sm">
          <AnimatedCharacter size={56} />
          <div>
            <p className="font-black text-gray-800 text-sm">
              {completedDays}/{totalDays} Days Completed
            </p>
            <div className="w-40 bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: totalDays > 0 ? `${(completedDays / totalDays) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">Loading your lessons...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            {error}
            <button
              onClick={() => session && loadData(session)}
              className="ml-2 underline font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && chapters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="font-black text-gray-600 text-xl">No chapters yet!</h2>
            <p className="text-gray-400 text-sm mt-2">
              Ask your teacher to upload lessons.
            </p>
          </div>
        )}

        {!loading && chapters.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-black text-gray-700 text-lg">Your Learning Journey</h2>
            {chapters.map(chapter => (
              <DayCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
