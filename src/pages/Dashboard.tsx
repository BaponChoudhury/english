import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getProgressForStudent, supabase } from '../lib/supabase'
import { StudentSession, Progress } from '../types'
import { CHAPTERS } from '../data/chapters'
import AnimatedCharacter from '../components/AnimatedCharacter'
import ProgressBar from '../components/ProgressBar'

const REQUIRED_REVISIONS = 10

interface DayStatus {
  day: number
  week: number
  title: string
  subtitle: string
  revisions: number
  isUnlocked: boolean
  isComplete: boolean
}

function computeDayStatuses(progressList: Progress[]): DayStatus[] {
  const progressMap = new Map<string, number>()
  const lastRevisedMap = new Map<string, string | null>()
  for (const p of progressList) {
    progressMap.set(p.day_key, p.revision_count)
    lastRevisedMap.set(p.day_key, p.last_revised_at ?? null)
  }

  return CHAPTERS.map((chapter, idx) => {
    const key = `day-${chapter.day}`
    const revisions = progressMap.get(key) ?? 0
    const isComplete = revisions >= REQUIRED_REVISIONS

    let isUnlocked = false
    if (idx === 0) {
      isUnlocked = true
    } else {
      const prevKey = `day-${CHAPTERS[idx - 1].day}`
      const prevRevisions = progressMap.get(prevKey) ?? 0
      if (prevRevisions >= REQUIRED_REVISIONS) {
        const lastRevised = lastRevisedMap.get(prevKey)
        if (lastRevised) {
          const lastDate = new Date(lastRevised).toDateString()
          const today = new Date().toDateString()
          isUnlocked = lastDate !== today
        }
      }
    }

    return {
      day: chapter.day,
      week: chapter.week,
      title: chapter.title,
      subtitle: chapter.subtitle,
      revisions,
      isUnlocked,
      isComplete,
    }
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)

  const loadProgress = useCallback((s: StudentSession) => {
    getProgressForStudent(s.id)
      .then(progressList => setDayStatuses(computeDayStatuses(progressList)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem('student_session')
    if (!raw) { navigate('/'); return }
    const s: StudentSession = JSON.parse(raw)
    setSession(s)
    loadProgress(s)
  }, [navigate, location.key, loadProgress])

  function handleLogout() {
    localStorage.removeItem('student_session')
    supabase.auth.signOut()
    navigate('/')
  }

  const completedDays = dayStatuses.filter(d => d.isComplete).length
  const weeks = [...new Set(CHAPTERS.map(c => c.week))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-black text-lg leading-tight">
            Hi, {session?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 text-xs">{session?.class}</p>
        </div>
        <button onClick={handleLogout}
          className="text-indigo-200 hover:text-white text-sm font-bold px-3 py-2 rounded-lg hover:bg-indigo-700 transition touch-target">
          Logout
        </button>
      </header>

      {!loading && (
        <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-100 shadow-sm">
          <AnimatedCharacter size={56} />
          <div className="flex-1">
            <p className="font-black text-gray-800 text-sm">
              {completedDays}/{CHAPTERS.length} Days Completed
            </p>
            <ProgressBar current={completedDays} total={CHAPTERS.length} label="" />
          </div>
        </div>
      )}

      <main className="px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">Loading your lessons…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.map(week => (
              <div key={week}>
                <h2 className="font-black text-indigo-700 text-base mb-3">
                  Week {week} — {week === 1 ? 'Greetings & Manners' : 'My Family & My Home'}
                </h2>
                <div className="space-y-3">
                  {dayStatuses.filter(d => d.week === week).map(day => (
                    <DayCard key={day.day} day={day} onTap={() => navigate(`/chapter/${day.day}`)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function DayCard({ day, onTap }: { day: DayStatus; onTap: () => void }) {
  const pct = Math.min((day.revisions / REQUIRED_REVISIONS) * 100, 100)

  if (!day.isUnlocked) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl shrink-0">
            🔒
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-semibold">Day {day.day}</p>
            <p className="font-black text-gray-400 truncate">{day.title}</p>
            <p className="text-xs text-gray-300 mt-0.5">
              Complete Day {day.day - 1} (10 revisions) to unlock
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white rounded-2xl shadow-md border-2 border-indigo-100 p-4 active:scale-98 transition-transform hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shrink-0 ${
          day.isComplete ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {day.isComplete ? '✅' : day.day}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-400 font-semibold">Day {day.day}</p>
          <p className="font-black text-gray-800 truncate">{day.title}</p>
          <p className="text-xs text-gray-400 truncate">{day.subtitle}</p>
        </div>
        <div className="text-indigo-400 text-xl shrink-0">›</div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1">
          <span>Revisions</span>
          <span>{day.revisions}/10</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${day.isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  )
}
