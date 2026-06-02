import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'

const LOTTIE_CDN_URL = 'https://assets9.lottiefiles.com/packages/lf20_myejiggj.json'

interface AnimatedCharacterProps {
  size?: number
  speaking?: boolean
  className?: string
}

export default function AnimatedCharacter({
  size = 200,
  speaking = false,
  className = ''
}: AnimatedCharacterProps) {
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(LOTTIE_CDN_URL)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => setError(true))
  }, [])

  if (error || !animationData) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-primary-100 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-6xl">🎓</span>
      </div>
    )
  }

  return (
    <div
      className={`${className} transition-transform duration-300 ${speaking ? 'scale-110' : 'scale-100'}`}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  )
}
