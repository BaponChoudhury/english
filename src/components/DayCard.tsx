import { useNavigate } from 'react-router-dom'
import { ChapterWithProgress } from '../types'
import ProgressBar from './ProgressBar'

interface DayCardProps {
  chapter: ChapterWithProgress
}

const REQUIRED_REVISIONS = 10

export default function DayCard({ chapter }: DayCardProps) {
  const navigate = useNavigate()
  const revisions = chapter.progress?.revision_count ?? 0
  const isComplete = revisions >= REQUIRED_REVISIONS
  const isLocked = !chapter.isUnlocked

  function handleClick() {
    if (isLocked) return
    navigate(`/chapter/${chapter.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        relative rounded-2xl p-4 shadow-md border-2 transition-all
        ${isLocked
          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
          : isComplete
          ? 'bg-green-50 border-green-400 cursor-pointer hover:shadow-lg active:scale-95'
          : 'bg-white border-indigo-200 cursor-pointer hover:shadow-lg active:scale-95'
        }
      `}
    >
      {/* Day badge */}
      <div className={`
        absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shadow
        ${isLocked ? 'bg-gray-400' : isComplete ? 'bg-green-500' : 'bg-indigo-600'}
      `}>
        {chapter.day_number}
      </div>

      {/* Lock/complete icon */}
      <div className="absolute top-3 right-3 text-xl">
        {isLocked ? '🔒' : isComplete ? '✅' : '📖'}
      </div>

      <div className="mt-2 pr-8">
        <h3 className="font-black text-gray-800 text-base leading-tight">{chapter.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">Day {chapter.day_number}</p>
      </div>

      {!isLocked && (
        <div className="mt-3">
          <ProgressBar
            current={revisions}
            total={REQUIRED_REVISIONS}
            label={`Revisions`}
            colorClass={isComplete ? 'bg-green-500' : 'bg-indigo-500'}
          />
        </div>
      )}

      {isLocked && (
        <p className="text-xs text-gray-400 mt-2 font-semibold">
          Complete the previous day to unlock
        </p>
      )}
    </div>
  )
}
