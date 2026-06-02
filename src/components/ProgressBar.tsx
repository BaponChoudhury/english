interface ProgressBarProps {
  current: number
  total: number
  label?: string
  colorClass?: string
}

export default function ProgressBar({
  current,
  total,
  label,
  colorClass = 'bg-primary-500'
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-sm font-bold text-primary-600">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-center mt-1 text-xs text-gray-500">{percent}% complete</div>
    </div>
  )
}
