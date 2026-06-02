import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapterById, getOrCreateProgress, incrementRevision } from '../lib/supabase'
import { StudentSession, Chapter as ChapterType, Progress, QuizQuestion } from '../types'
import { speakText } from '../lib/translation'
import AnimatedCharacter from '../components/AnimatedCharacter'
import ProgressBar from '../components/ProgressBar'

function generateQuiz(sentences: string[]): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  for (const sentence of sentences) {
    const words = sentence.split(' ').filter(w => w.length > 3)
    if (words.length === 0) continue

    const targetWord = words[Math.floor(Math.random() * words.length)].replace(/[^a-zA-Z]/g, '')
    if (!targetWord) continue

    const blanked = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '______')
    if (blanked === sentence) continue

    // Generate wrong options from other sentences
    const allWords = sentences
      .join(' ')
      .split(' ')
      .map(w => w.replace(/[^a-zA-Z]/g, ''))
      .filter(w => w.length > 3 && w.toLowerCase() !== targetWord.toLowerCase())
    const shuffled = allWords.sort(() => 0.5 - Math.random())
    const distractors = [...new Set(shuffled)].slice(0, 3)

    const options = [...distractors, targetWord].sort(() => 0.5 - Math.random())
    questions.push({ sentence, blankedSentence: blanked, answer: targetWord, options })
    if (questions.length >= 5) break
  }
  return questions
}

type Phase = 'lesson' | 'quiz' | 'complete'

export default function Chapter() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [chapter, setChapter] = useState<ChapterType | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('lesson')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('student_session')
    if (!raw) { navigate('/'); return }
    const s: StudentSession = JSON.parse(raw)
    setSession(s)
    loadChapter(s)
    return () => { window.speechSynthesis?.cancel() }
  }, [id, navigate])

  async function loadChapter(s: StudentSession) {
    if (!id) return
    try {
      setLoading(true)
      const [c, p] = await Promise.all([
        getChapterById(id),
        getOrCreateProgress(s.id, id)
      ])
      setChapter(c)
      setProgress(p)
    } catch (err) {
      setError('Failed to load chapter.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSpeak(text: string) {
    setSpeaking(true)
    speakText(text)
    setTimeout(() => setSpeaking(false), (text.length * 60) + 500)
  }

  function handleNext() {
    const sentences = chapter?.content ?? []
    if (sentenceIndex < sentences.length - 1) {
      setSentenceIndex(i => i + 1)
    } else {
      const q = generateQuiz(sentences)
      setQuiz(q)
      setPhase('quiz')
    }
  }

  function handleAnswerSelect(answer: string) {
    if (selectedAnswer) return
    setSelectedAnswer(answer)
    if (answer === quiz[quizIndex].answer) {
      setQuizScore(s => s + 1)
    }
  }

  function handleNextQuiz() {
    setSelectedAnswer(null)
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(i => i + 1)
    } else {
      setPhase('complete')
    }
  }

  function handleFinish() {
    if (!session || !id) return
    navigate(`/practice/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold">{error || 'Chapter not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 underline font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const sentences = chapter.content ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        <button
          onClick={() => { window.speechSynthesis?.cancel(); navigate('/dashboard') }}
          className="text-2xl touch-target flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-200">Day {chapter.day_number}</p>
          <h1 className="font-black truncate">{chapter.title}</h1>
        </div>
        <div className="text-xs text-indigo-200 shrink-0">
          {progress?.revision_count ?? 0}/10 revisions
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {phase === 'lesson' && (
          <LessonPhase
            sentences={sentences}
            index={sentenceIndex}
            speaking={speaking}
            onSpeak={handleSpeak}
            onNext={handleNext}
            onPractice={() => navigate(`/practice/${id}`)}
          />
        )}

        {phase === 'quiz' && quiz.length > 0 && (
          <QuizPhase
            question={quiz[quizIndex]}
            questionNumber={quizIndex + 1}
            total={quiz.length}
            selectedAnswer={selectedAnswer}
            onSelect={handleAnswerSelect}
            onNext={handleNextQuiz}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase
            score={quizScore}
            total={quiz.length}
            revisions={(progress?.revision_count ?? 0) + 1}
            onFinish={handleFinish}
            chapterId={id!}
            studentId={session?.id ?? ''}
          />
        )}
      </div>
    </div>
  )
}

function LessonPhase({
  sentences,
  index,
  speaking,
  onSpeak,
  onNext,
  onPractice
}: {
  sentences: string[]
  index: number
  speaking: boolean
  onSpeak: (t: string) => void
  onNext: () => void
  onPractice: () => void
}) {
  const sentence = sentences[index] ?? ''
  const isLast = index === sentences.length - 1

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <AnimatedCharacter size={160} speaking={speaking} />

      <ProgressBar
        current={index + 1}
        total={sentences.length}
        label="Lesson Progress"
      />

      <div className="bg-white rounded-2xl shadow-md p-6 w-full border-2 border-indigo-100">
        <p className="text-lg font-black text-gray-800 leading-relaxed text-center">
          {sentence}
        </p>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => onSpeak(sentence)}
          className="flex-1 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black rounded-xl py-4 text-base shadow touch-target"
        >
          🔊 Listen
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black rounded-xl py-4 text-base shadow touch-target"
        >
          {isLast ? 'Take Quiz →' : 'Next →'}
        </button>
      </div>

      <button
        onClick={onPractice}
        className="w-full bg-green-100 hover:bg-green-200 text-green-800 font-bold rounded-xl py-3 text-sm border border-green-300 touch-target"
      >
        🎤 Practice Speaking Instead
      </button>
    </div>
  )
}

function QuizPhase({
  question,
  questionNumber,
  total,
  selectedAnswer,
  onSelect,
  onNext
}: {
  question: QuizQuestion
  questionNumber: number
  total: number
  selectedAnswer: string | null
  onSelect: (a: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 font-black px-4 py-1 rounded-full text-sm">
          Quiz: {questionNumber}/{total}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-indigo-100">
        <p className="text-sm text-gray-500 font-semibold mb-2">Fill in the blank:</p>
        <p className="text-base font-black text-gray-800 leading-relaxed">
          {question.blankedSentence}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map(option => {
          let colorClass = 'bg-white border-2 border-gray-200 text-gray-800'
          if (selectedAnswer) {
            if (option === question.answer) {
              colorClass = 'bg-green-100 border-2 border-green-500 text-green-800'
            } else if (option === selectedAnswer) {
              colorClass = 'bg-red-100 border-2 border-red-500 text-red-800'
            }
          }
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={!!selectedAnswer}
              className={`${colorClass} font-bold rounded-xl py-4 px-3 text-sm transition-all active:scale-95 touch-target`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {selectedAnswer && (
        <div className={`rounded-xl px-4 py-3 text-center font-black ${
          selectedAnswer === question.answer
            ? 'bg-green-50 text-green-700 border border-green-300'
            : 'bg-red-50 text-red-700 border border-red-300'
        }`}>
          {selectedAnswer === question.answer
            ? '🎉 Correct!'
            : `❌ Answer: "${question.answer}"`}
        </div>
      )}

      {selectedAnswer && (
        <button
          onClick={onNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 shadow touch-target"
        >
          Next Question →
        </button>
      )}
    </div>
  )
}

function CompletePhase({
  score,
  total,
  revisions,
  onFinish,
  chapterId,
  studentId
}: {
  score: number
  total: number
  revisions: number
  onFinish: () => void
  chapterId: string
  studentId: string
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (saved) return
    setSaving(true)
    incrementRevision(studentId, chapterId)
      .then(() => setSaved(true))
      .catch(console.error)
      .finally(() => setSaving(false))
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto w-full py-8">
      <div className="text-6xl">🎊</div>
      <h2 className="font-black text-2xl text-gray-800 text-center">Chapter Complete!</h2>

      <div className="bg-white rounded-2xl shadow-md p-6 w-full text-center border-2 border-green-200">
        <p className="text-4xl font-black text-green-600">{score}/{total}</p>
        <p className="text-gray-600 font-semibold mt-1">Quiz Score</p>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 w-full text-center border border-indigo-200">
        <p className="text-indigo-700 font-black text-lg">{revisions}/10 Revisions</p>
        <p className="text-indigo-500 text-sm mt-1">
          {revisions < 10
            ? `${10 - revisions} more revision${10 - revisions !== 1 ? 's' : ''} to unlock next day!`
            : '🎉 All revisions done! Next day unlocked tomorrow!'}
        </p>
      </div>

      {saving && <p className="text-gray-400 text-sm">Saving progress...</p>}

      <button
        onClick={onFinish}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-black rounded-xl py-4 text-lg shadow-lg touch-target"
      >
        🎤 Practice Speaking
      </button>
    </div>
  )
}
