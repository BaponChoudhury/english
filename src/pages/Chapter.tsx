import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrCreateProgress, incrementRevision } from '../lib/supabase'
import { StudentSession, Progress, QuizQuestion } from '../types'
import { speakText } from '../lib/translation'
import ProgressBar from '../components/ProgressBar'
import { CHAPTERS, ChapterData } from '../data/chapters'

// Quiz: show emoji → student picks the correct English word
function buildQuiz(chapter: ChapterData): QuizQuestion[] {
  const pool = chapter.vocabulary.filter(v => v.emoji)
  if (pool.length < 4) {
    // Fallback: use all vocab without emoji requirement
    const fb = chapter.vocabulary
    const questions: QuizQuestion[] = []
    for (const item of fb.slice(0, 5)) {
      const others = fb.filter(v => v.word !== item.word).sort(() => 0.5 - Math.random()).slice(0, 3)
      if (others.length < 3) continue
      const options = [...others.map(o => o.word), item.word].sort(() => 0.5 - Math.random())
      questions.push({ sentence: item.word, blankedSentence: `Which word means: "${item.word}"?`, answer: item.word, options })
    }
    return questions
  }
  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 5).flatMap(item => {
    const others = pool.filter(v => v.word !== item.word).sort(() => 0.5 - Math.random()).slice(0, 3)
    if (others.length < 3) return []
    const options = [...others.map(o => o.word), item.word].sort(() => 0.5 - Math.random())
    return [{ sentence: item.word, blankedSentence: item.emoji ?? item.word, answer: item.word, options }]
  })
}

function isTeacher(speaker: string) {
  return /teacher|sir|miss|madam|instructor/i.test(speaker)
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
  const [activeLine, setActiveLine] = useState(-1)
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
    const dur = Math.max(1500, text.length * 70 + 800)
    setTimeout(() => setSpeaking(false), dur)
  }

  function startDialoguePlayback(lines: { speaker: string; text: string }[]) {
    let delay = 0
    lines.forEach((line, i) => {
      setTimeout(() => setActiveLine(i), delay)
      setTimeout(() => speakText(line.text), delay + 100)
      delay += Math.max(1800, line.text.length * 75 + 1000)
    })
    setTimeout(() => setActiveLine(-1), delay)
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
        <button onClick={() => { window.speechSynthesis?.cancel(); navigate('/dashboard') }}
          className="text-2xl touch-target flex items-center justify-center w-10">←</button>
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
        {(['vocab', 'lesson', 'dialogue', 'quiz'] as Phase[]).filter(p => !(p === 'quiz' && chapter.day === 1)).map((p, i) => (
          <button key={p} onClick={() => setPhase(p)}
            className={`flex-1 py-2 text-xs font-bold rounded-t-lg transition ${
              phase === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {(['📚 Words', '🗣️ Speak', '💬 Talk', '📝 Quiz'] as const).filter((_, j) => !(j === 3 && chapter.day === 1))[i]}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {phase === 'vocab' && (
          <VocabPhase chapter={chapter} index={vocabIndex} speaking={speaking} onSpeak={speak}
            onNext={() => { if (vocabIndex < chapter.vocabulary.length - 1) setVocabIndex(i => i + 1); else setPhase('lesson') }}
            onPrev={() => setVocabIndex(i => Math.max(0, i - 1))} />
        )}
        {phase === 'lesson' && (
          <LessonPhase chapter={chapter} index={sentenceIndex} speaking={speaking} onSpeak={speak}
            onNext={() => { if (sentenceIndex < chapter.sentences.length - 1) setSentenceIndex(i => i + 1); else setPhase('dialogue') }}
            onPrev={() => setSentenceIndex(i => Math.max(0, i - 1))} />
        )}
        {phase === 'dialogue' && (
          <DialoguePhase chapter={chapter} index={dialogueIndex} activeLine={activeLine}
            onPlay={() => { setActiveLine(0); startDialoguePlayback(chapter.dialogues[dialogueIndex].lines) }}
            onNext={() => {
              setActiveLine(-1)
              if (dialogueIndex < chapter.dialogues.length - 1) { setDialogueIndex(i => i + 1) }
              else if (chapter.day === 1) { setPhase('complete') }
              else { const q = buildQuiz(chapter); setQuiz(q); setQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setPhase('quiz') }
            }}
            onPrev={() => { setActiveLine(-1); setDialogueIndex(i => Math.max(0, i - 1)) }} />
        )}
        {phase === 'quiz' && (
          quiz.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-gray-500 font-bold">No quiz for this chapter yet.</p>
              <button onClick={() => setPhase('complete')} className="mt-4 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl">Finish →</button>
            </div>
          ) : quizIndex < quiz.length ? (
            <QuizPhase question={quiz[quizIndex]} questionNumber={quizIndex + 1} total={quiz.length}
              selectedAnswer={selectedAnswer}
              onSelect={answer => { if (selectedAnswer) return; setSelectedAnswer(answer); if (answer === quiz[quizIndex].answer) setQuizScore(s => s + 1) }}
              onNext={() => { setSelectedAnswer(null); if (quizIndex < quiz.length - 1) setQuizIndex(i => i + 1); else setPhase('complete') }} />
          ) : null
        )}
        {phase === 'complete' && (
          <CompletePhase score={quizScore} total={quiz.length} currentRevisions={progress?.revision_count ?? 0}
            studentId={session?.id ?? ''} dayKey={`day-${chapter.day}`}
            onGoBack={() => navigate('/dashboard')} onPractice={() => navigate(`/practice/${chapter.day}`)} />
        )}
      </div>
    </div>
  )
}

// ── Characters ────────────────────────────────────────────────────────────────

function TeacherAvatar({ active, size = 56 }: { active?: boolean; size?: number }) {
  return (
    <div className={`flex flex-col items-center gap-1 transition-transform ${active ? 'scale-110' : ''}`}>
      <div style={{ width: size, height: size }}
        className={`rounded-full flex items-center justify-center text-3xl shadow-lg border-4 ${
          active ? 'border-purple-500 bg-purple-100 animate-bounce' : 'border-purple-300 bg-purple-50'
        }`}>
        👩‍🏫
      </div>
      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
        Teacher
      </span>
    </div>
  )
}

function StudentAvatar({ name, active, size = 56 }: { name: string; active?: boolean; size?: number }) {
  const emoji = name.toLowerCase().includes('child b') || name.toLowerCase().includes('2') ? '👧' : '👦'
  const label = name.replace('Child ', 'Child ').replace('Students', 'Students')
  return (
    <div className={`flex flex-col items-center gap-1 transition-transform ${active ? 'scale-110' : ''}`}>
      <div style={{ width: size, height: size }}
        className={`rounded-full flex items-center justify-center text-3xl shadow-lg border-4 ${
          active ? 'border-blue-500 bg-blue-100 animate-bounce' : 'border-blue-300 bg-blue-50'
        }`}>
        {emoji}
      </div>
      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
        {label}
      </span>
    </div>
  )
}

// ── VocabPhase ────────────────────────────────────────────────────────────────

function VocabPhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string) => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.vocabulary[index]
  const isLast = index === chapter.vocabulary.length - 1

  // Auto-play each word when index changes (user already tapped to get here)
  useEffect(() => { onSpeak(item.word) }, [index])

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <TeacherAvatar active={speaking} size={64} />
      <ProgressBar current={index + 1} total={chapter.vocabulary.length} label="Vocabulary" />
      <button
        className="bg-white rounded-3xl shadow-lg p-8 w-full border-2 border-indigo-100 text-center active:scale-95 transition-transform"
        onClick={() => onSpeak(item.word)}>
        {item.emoji && <div className="text-6xl mb-3">{item.emoji}</div>}
        <p className="text-3xl font-black text-indigo-700">{item.word}</p>
        <p className="text-sm text-gray-400 mt-2">🔊 Tap to hear again</p>
      </button>
      <div className="flex gap-3 w-full">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">← Back</button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Start Lesson →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── LessonPhase ───────────────────────────────────────────────────────────────

function LessonPhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string) => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.sentences[index]
  const isLast = index === chapter.sentences.length - 1

  // Auto-play each sentence when index changes
  useEffect(() => { onSpeak(item.text) }, [index])

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <TeacherAvatar active={speaking} size={64} />
      <ProgressBar current={index + 1} total={chapter.sentences.length} label="Sentences" />
      <div className="bg-white rounded-3xl shadow-lg p-6 w-full border-2 border-purple-100 text-center">
        {item.emoji && <div className="text-5xl mb-3">{item.emoji}</div>}
        <p className="text-2xl font-black text-gray-800 leading-relaxed">{item.text}</p>
      </div>
      <p className="text-sm text-indigo-500 font-semibold">Say it out loud! 🗣️</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => onSpeak(item.text)}
          className="flex-1 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black rounded-xl py-4 touch-target text-lg">
          🔊 Again
        </button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Dialogues →' : 'Next →'}
        </button>
      </div>
      <button onClick={onPrev} disabled={index === 0}
        className="w-full text-gray-400 text-sm font-semibold disabled:opacity-30 py-2">← Previous</button>
    </div>
  )
}

// ── DialoguePhase ─────────────────────────────────────────────────────────────

function DialoguePhase({ chapter, index, activeLine, onPlay, onNext, onPrev }: {
  chapter: ChapterData; index: number; activeLine: number
  onPlay: () => void; onNext: () => void; onPrev: () => void
}) {
  const dialogue = chapter.dialogues[index]
  const isLast = index === chapter.dialogues.length - 1

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <span className="inline-block bg-purple-100 text-purple-700 font-black px-4 py-1 rounded-full text-sm">
          Dialogue {index + 1} of {chapter.dialogues.length}
        </span>
      </div>

      {/* Character row */}
      <div className="flex justify-around items-end bg-gradient-to-b from-sky-100 to-green-50 rounded-2xl p-4 border-2 border-sky-200">
        {dialogue.lines.some(l => isTeacher(l.speaker)) && (
          <TeacherAvatar active={activeLine >= 0 && isTeacher(dialogue.lines[activeLine]?.speaker)} size={64} />
        )}
        {dialogue.lines.filter(l => !isTeacher(l.speaker)).filter((l, i, arr) => arr.findIndex(x => x.speaker === l.speaker) === i).map(l => (
          <StudentAvatar key={l.speaker} name={l.speaker} size={64}
            active={activeLine >= 0 && dialogue.lines[activeLine]?.speaker === l.speaker} />
        ))}
      </div>

      {/* Chat bubbles */}
      <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-purple-100 space-y-3">
        {dialogue.lines.map((line, i) => {
          const teacher = isTeacher(line.speaker)
          const isActive = activeLine === i
          return (
            <div key={i} className={`flex gap-3 items-start ${!teacher ? 'flex-row-reverse' : ''} transition-all`}>
              <div className={`text-2xl shrink-0 transition-transform ${isActive ? 'scale-125' : ''}`}>
                {teacher ? '👩‍🏫' : (line.speaker.toLowerCase().includes('b') || line.speaker.includes('2') ? '👧' : '👦')}
              </div>
              <div className={`flex-1 rounded-2xl px-3 py-2 transition-all ${
                teacher
                  ? isActive ? 'bg-purple-200 border-2 border-purple-500 shadow-md' : 'bg-purple-50 border border-purple-200'
                  : isActive ? 'bg-blue-200 border-2 border-blue-500 shadow-md' : 'bg-blue-50 border border-blue-200'
              } ${!teacher ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                <p className={`text-xs font-black mb-0.5 ${teacher ? 'text-purple-600' : 'text-blue-600'}`}>
                  {teacher ? '👩‍🏫 ' : ''}{line.speaker}
                </p>
                <p className={`font-bold text-gray-800 ${isActive ? 'text-base' : 'text-sm'}`}>{line.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={onPlay}
        className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black rounded-xl py-3 touch-target text-lg shadow">
        ▶️ Play Dialogue
      </button>
      <div className="flex gap-3">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">← Back</button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Take Quiz →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── QuizPhase ─────────────────────────────────────────────────────────────────

function QuizPhase({ question, questionNumber, total, selectedAnswer, onSelect, onNext }: {
  question: QuizQuestion; questionNumber: number; total: number
  selectedAnswer: string | null; onSelect: (a: string) => void; onNext: () => void
}) {
  const isEmoji = question.blankedSentence.length <= 4 && !question.blankedSentence.includes(' ')
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 font-black px-4 py-1 rounded-full text-sm">
          Question {questionNumber} of {total}
        </span>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-indigo-100 text-center">
        {isEmoji ? (
          <>
            <div className="text-7xl mb-3">{question.blankedSentence}</div>
            <p className="text-base font-bold text-gray-600">What does this mean in English?</p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-semibold mb-2">Choose the correct word:</p>
            <p className="text-xl font-black text-gray-800">{question.blankedSentence}</p>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map(option => {
          let cls = 'bg-white border-2 border-gray-200 text-gray-800 hover:border-indigo-400'
          if (selectedAnswer) {
            if (option === question.answer) cls = 'bg-green-100 border-2 border-green-500 text-green-800'
            else if (option === selectedAnswer) cls = 'bg-red-100 border-2 border-red-500 text-red-800'
          }
          return (
            <button key={option} onClick={() => onSelect(option)} disabled={!!selectedAnswer}
              className={`${cls} font-bold rounded-xl py-5 px-3 text-base transition-all active:scale-95 touch-target`}>
              {option}
            </button>
          )
        })}
      </div>
      {selectedAnswer && (
        <>
          <div className={`rounded-xl px-4 py-4 text-center font-black text-lg ${
            selectedAnswer === question.answer
              ? 'bg-green-50 text-green-700 border-2 border-green-400'
              : 'bg-red-50 text-red-700 border-2 border-red-400'
          }`}>
            {selectedAnswer === question.answer ? '🎉 Correct! Well done!' : `❌ The answer is: "${question.answer}"`}
          </div>
          <button onClick={onNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 shadow touch-target text-lg">
            Next →
          </button>
        </>
      )}
    </div>
  )
}

// ── CompletePhase ─────────────────────────────────────────────────────────────

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

  const pct = Math.round((score / Math.max(total, 1)) * 100)

  return (
    <div className="flex flex-col items-center gap-5 max-w-lg mx-auto w-full py-6">
      <div className="text-7xl">{pct >= 80 ? '🌟' : pct >= 50 ? '😊' : '💪'}</div>
      <h2 className="font-black text-2xl text-gray-800 text-center">
        {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good job!' : 'Keep practising!'}
      </h2>
      <div className="bg-white rounded-2xl shadow-md p-6 w-full text-center border-2 border-green-200">
        <p className="text-5xl font-black text-green-600">{score}<span className="text-2xl text-gray-400">/{total}</span></p>
        <p className="text-gray-500 font-semibold mt-1">Quiz Score</p>
        <div className="w-full bg-gray-100 rounded-full h-3 mt-3">
          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="bg-indigo-50 rounded-2xl p-4 w-full text-center border border-indigo-200">
        {saving ? (
          <p className="text-indigo-400 text-sm">Saving progress…</p>
        ) : (
          <>
            <p className="text-indigo-700 font-black text-xl">{newRevisions}/10 Revisions</p>
            <p className="text-indigo-500 text-sm mt-1">
              {newRevisions < 10
                ? `${10 - newRevisions} more revision${10 - newRevisions !== 1 ? 's' : ''} to unlock the next day!`
                : '🎉 All done! Next day unlocks tomorrow.'}
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
