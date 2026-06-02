import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrCreateProgress, incrementRevision } from '../lib/supabase'
import { StudentSession, Progress, QuizQuestion } from '../types'
import { speakText } from '../lib/translation'
import AnimatedCharacter from '../components/AnimatedCharacter'
import ProgressBar from '../components/ProgressBar'
import { CHAPTERS, ChapterData } from '../data/chapters'

function buildQuiz(chapter: ChapterData): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const pool = chapter.quizWords
  const shuffled = [...pool].sort(() => 0.5 - Math.random())

  for (const answer of shuffled.slice(0, 5)) {
    const distractors = pool
      .filter(w => w !== answer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    if (distractors.length < 3) continue
    const options = [...distractors, answer].sort(() => 0.5 - Math.random())
    const sentence = chapter.sentences.find(s => s.text.toLowerCase().includes(answer.toLowerCase()))
    const blanked = sentence
      ? sentence.text.replace(new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '______')
      : `What is this word? ______`
    questions.push({ sentence: sentence?.text ?? answer, blankedSentence: blanked, answer, options })
  }
  return questions
}

type Phase = 'vocab' | 'lesson' | 'dialogue' | 'quiz' | 'complete'

export default function Chapter() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('vocab')
  const [vocabIndex, setVocabIndex] = useState(0)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizScore, setQuizScore] = useState(0)

  const chapter: ChapterData | undefined = CHAPTERS.find(c => c.day === Number(dayNum))

  useEffect(() => {
    const raw = localStorage.getItem('student_session')
    if (!raw) { navigate('/'); return }
    const s: StudentSession = JSON.parse(raw)
    setSession(s)
    if (!chapter) { navigate('/dashboard'); return }
    getOrCreateProgress(s.id, `day-${chapter.day}`)
      .then(p => setProgress(p))
      .catch(console.error)
      .finally(() => setLoading(false))
    return () => { window.speechSynthesis?.cancel() }
  }, [dayNum, navigate])

  function speak(text: string) {
    setSpeaking(true)
    speakText(text)
    setTimeout(() => setSpeaking(false), text.length * 60 + 800)
  }

  if (loading || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      <header className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        <button
          onClick={() => { window.speechSynthesis?.cancel(); navigate('/dashboard') }}
          className="text-2xl touch-target flex items-center justify-center w-10"
        >←</button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-200">{chapter.subtitle} · Day {chapter.day}</p>
          <h1 className="font-black truncate">{chapter.title}</h1>
        </div>
        <div className="text-xs text-indigo-200 shrink-0 text-right">
          <div>{progress?.revision_count ?? 0}/10</div>
          <div>revisions</div>
        </div>
      </header>

      {/* Phase tabs */}
      <div className="flex bg-white border-b border-gray-100 px-2 pt-2 gap-1">
        {(['vocab', 'lesson', 'dialogue', 'quiz'] as Phase[]).map((p, i) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`flex-1 py-2 text-xs font-bold rounded-t-lg transition ${
              phase === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {['📚 Words', '🗣️ Speak', '💬 Talk', '📝 Quiz'][i]}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {phase === 'vocab' && (
          <VocabPhase
            chapter={chapter}
            index={vocabIndex}
            speaking={speaking}
            onSpeak={speak}
            onNext={() => {
              if (vocabIndex < chapter.vocabulary.length - 1) setVocabIndex(i => i + 1)
              else setPhase('lesson')
            }}
            onPrev={() => setVocabIndex(i => Math.max(0, i - 1))}
          />
        )}

        {phase === 'lesson' && (
          <LessonPhase
            chapter={chapter}
            index={sentenceIndex}
            speaking={speaking}
            onSpeak={speak}
            onNext={() => {
              if (sentenceIndex < chapter.sentences.length - 1) setSentenceIndex(i => i + 1)
              else setPhase('dialogue')
            }}
            onPrev={() => setSentenceIndex(i => Math.max(0, i - 1))}
          />
        )}

        {phase === 'dialogue' && (
          <DialoguePhase
            chapter={chapter}
            index={dialogueIndex}
            speaking={speaking}
            onSpeak={speak}
            onNext={() => {
              if (dialogueIndex < chapter.dialogues.length - 1) setDialogueIndex(i => i + 1)
              else {
                const q = buildQuiz(chapter)
                setQuiz(q)
                setQuizIndex(0)
                setQuizScore(0)
                setSelectedAnswer(null)
                setPhase('quiz')
              }
            }}
            onPrev={() => setDialogueIndex(i => Math.max(0, i - 1))}
          />
        )}

        {phase === 'quiz' && (
          quiz.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No quiz available for this chapter.</p>
              <button onClick={() => setPhase('complete')} className="mt-4 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl">
                Finish →
              </button>
            </div>
          ) : quizIndex < quiz.length ? (
            <QuizPhase
              question={quiz[quizIndex]}
              questionNumber={quizIndex + 1}
              total={quiz.length}
              selectedAnswer={selectedAnswer}
              onSelect={answer => {
                if (selectedAnswer) return
                setSelectedAnswer(answer)
                if (answer === quiz[quizIndex].answer) setQuizScore(s => s + 1)
              }}
              onNext={() => {
                setSelectedAnswer(null)
                if (quizIndex < quiz.length - 1) setQuizIndex(i => i + 1)
                else setPhase('complete')
              }}
            />
          ) : null
        )}

        {phase === 'complete' && (
          <CompletePhase
            score={quizScore}
            total={quiz.length}
            currentRevisions={progress?.revision_count ?? 0}
            studentId={session?.id ?? ''}
            dayKey={`day-${chapter.day}`}
            onGoBack={() => navigate('/dashboard')}
            onPractice={() => navigate(`/practice/${chapter.day}`)}
          />
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function VocabPhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string) => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.vocabulary[index]
  const isLast = index === chapter.vocabulary.length - 1
  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <AnimatedCharacter size={130} speaking={speaking} />
      <ProgressBar current={index + 1} total={chapter.vocabulary.length} label="Vocabulary" />
      <div
        className="bg-white rounded-3xl shadow-lg p-8 w-full border-2 border-indigo-100 text-center cursor-pointer active:scale-95 transition-transform"
        onClick={() => onSpeak(item.word)}
      >
        {item.emoji && <div className="text-6xl mb-3">{item.emoji}</div>}
        <p className="text-3xl font-black text-indigo-700">{item.word}</p>
        <p className="text-sm text-gray-400 mt-2">Tap to hear</p>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">
          ← Back
        </button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Start Lesson →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

function LessonPhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string) => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.sentences[index]
  const isLast = index === chapter.sentences.length - 1
  useEffect(() => { onSpeak(item.text) }, [index])

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <AnimatedCharacter size={130} speaking={speaking} />
      <ProgressBar current={index + 1} total={chapter.sentences.length} label="Sentences" />
      <div className="bg-white rounded-3xl shadow-lg p-6 w-full border-2 border-purple-100 text-center">
        {item.emoji && <div className="text-5xl mb-3">{item.emoji}</div>}
        <p className="text-2xl font-black text-gray-800 leading-relaxed">{item.text}</p>
      </div>
      <p className="text-sm text-indigo-500 font-semibold">Say it out loud! 🗣️</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => onSpeak(item.text)}
          className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-4 touch-target">
          🔊 Again
        </button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Dialogues →' : 'Next →'}
        </button>
      </div>
      <button onClick={onPrev} disabled={index === 0}
        className="w-full text-gray-400 text-sm font-semibold disabled:opacity-30">
        ← Previous sentence
      </button>
    </div>
  )
}

function DialoguePhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string) => void; onNext: () => void; onPrev: () => void
}) {
  const dialogue = chapter.dialogues[index]
  const isLast = index === chapter.dialogues.length - 1

  function playDialogue() {
    let delay = 0
    for (const line of dialogue.lines) {
      setTimeout(() => onSpeak(line.text), delay)
      delay += line.text.length * 70 + 1000
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <span className="inline-block bg-purple-100 text-purple-700 font-black px-4 py-1 rounded-full text-sm">
          Dialogue {index + 1} of {chapter.dialogues.length}
        </span>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-purple-100 space-y-3">
        {dialogue.lines.map((line, i) => (
          <div key={i} className={`flex gap-3 items-start ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              i % 2 === 0 ? 'bg-indigo-600 text-white' : 'bg-pink-400 text-white'
            }`}>
              {line.speaker[0]}
            </div>
            <div className={`flex-1 rounded-2xl px-3 py-2 ${
              i % 2 === 0 ? 'bg-indigo-50 rounded-tl-none' : 'bg-pink-50 rounded-tr-none'
            }`}>
              <p className="text-xs text-gray-400 font-semibold">{line.speaker}</p>
              <p className="font-bold text-gray-800">{line.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={playDialogue}
        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-3 touch-target">
        🔊 Play Dialogue
      </button>
      <div className="flex gap-3">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">
          ← Back
        </button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Take Quiz →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

function QuizPhase({ question, questionNumber, total, selectedAnswer, onSelect, onNext }: {
  question: QuizQuestion; questionNumber: number; total: number
  selectedAnswer: string | null; onSelect: (a: string) => void; onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 font-black px-4 py-1 rounded-full text-sm">
          Quiz {questionNumber}/{total}
        </span>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-indigo-100">
        <p className="text-sm text-gray-500 font-semibold mb-2">Choose the correct word:</p>
        <p className="text-lg font-black text-gray-800 leading-relaxed">{question.blankedSentence}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map(option => {
          let cls = 'bg-white border-2 border-gray-200 text-gray-800'
          if (selectedAnswer) {
            if (option === question.answer) cls = 'bg-green-100 border-2 border-green-500 text-green-800'
            else if (option === selectedAnswer) cls = 'bg-red-100 border-2 border-red-500 text-red-800'
          }
          return (
            <button key={option} onClick={() => onSelect(option)} disabled={!!selectedAnswer}
              className={`${cls} font-bold rounded-xl py-4 px-3 text-sm transition-all active:scale-95 touch-target`}>
              {option}
            </button>
          )
        })}
      </div>
      {selectedAnswer && (
        <>
          <div className={`rounded-xl px-4 py-3 text-center font-black ${
            selectedAnswer === question.answer
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-red-50 text-red-700 border border-red-300'
          }`}>
            {selectedAnswer === question.answer ? '🎉 Correct!' : `❌ Answer: "${question.answer}"`}
          </div>
          <button onClick={onNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 shadow touch-target">
            Next →
          </button>
        </>
      )}
    </div>
  )
}

function CompletePhase({ score, total, currentRevisions, studentId, dayKey, onGoBack, onPractice }: {
  score: number; total: number; currentRevisions: number
  studentId: string; dayKey: string; onGoBack: () => void; onPractice: () => void
}) {
  const [saving, setSaving] = useState(true)
  const [newRevisions, setNewRevisions] = useState(currentRevisions)

  useEffect(() => {
    incrementRevision(studentId, dayKey)
      .then(p => setNewRevisions(p.revision_count))
      .catch(console.error)
      .finally(() => setSaving(false))
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 max-w-lg mx-auto w-full py-6">
      <div className="text-6xl">🎊</div>
      <h2 className="font-black text-2xl text-gray-800 text-center">Chapter Complete!</h2>
      <div className="bg-white rounded-2xl shadow-md p-6 w-full text-center border-2 border-green-200">
        <p className="text-4xl font-black text-green-600">{score}/{total}</p>
        <p className="text-gray-500 font-semibold mt-1">Quiz Score</p>
      </div>
      <div className="bg-indigo-50 rounded-2xl p-4 w-full text-center border border-indigo-200">
        {saving ? (
          <p className="text-indigo-400 text-sm">Saving progress…</p>
        ) : (
          <>
            <p className="text-indigo-700 font-black text-xl">{newRevisions}/10 Revisions</p>
            <p className="text-indigo-500 text-sm mt-1">
              {newRevisions < 10
                ? `${10 - newRevisions} more to unlock the next day!`
                : '🎉 Done! Next day unlocks tomorrow.'}
            </p>
            <ProgressBar current={Math.min(newRevisions, 10)} total={10} label="" />
          </>
        )}
      </div>
      <button onClick={onPractice}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-black rounded-xl py-4 text-lg shadow-lg touch-target">
        🎤 Practice Speaking
      </button>
      <button onClick={onGoBack}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl py-3 touch-target">
        ← Back to Dashboard
      </button>
    </div>
  )
}
