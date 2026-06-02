import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrCreateProgress, incrementRevision } from '../lib/supabase'
import { StudentSession, Progress, QuizQuestion } from '../types'
import { speakAs, getSpeakerRole } from '../lib/translation'
import ProgressBar from '../components/ProgressBar'
import { CHAPTERS, ChapterData } from '../data/chapters'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isTeacher(speaker: string) {
  return /teacher|sir|miss|madam|instructor/i.test(speaker)
}

function normalise(text: string) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
}

function isGoodMatch(heard: string, target: string): boolean {
  const h = normalise(heard)
  const t = normalise(target)
  if (h === t) return true
  const words = t.split(' ').filter(w => w.length > 2)
  if (words.length === 0) return h.includes(t)
  return words.filter(w => h.includes(w)).length >= Math.ceil(words.length * 0.55)
}

function buildQuiz(chapter: ChapterData): QuizQuestion[] {
  const pool = chapter.vocabulary.filter(v => v.emoji)
  const base = pool.length >= 4 ? pool : chapter.vocabulary
  return base.sort(() => 0.5 - Math.random()).slice(0, 5).flatMap(item => {
    const others = base.filter(v => v.word !== item.word).sort(() => 0.5 - Math.random()).slice(0, 3)
    if (others.length < 3) return []
    const options = [...others.map(o => o.word), item.word].sort(() => 0.5 - Math.random())
    const prompt = item.emoji ?? `"${item.word}"`
    return [{ sentence: item.word, blankedSentence: prompt, answer: item.word, options }]
  })
}

// ── Avatars ───────────────────────────────────────────────────────────────────

function TeacherAvatar({ active, size = 56 }: { active?: boolean; size?: number }) {
  return (
    <div className={`flex flex-col items-center gap-1 transition-all ${active ? 'scale-115' : ''}`}>
      <div style={{ width: size, height: size }}
        className={`rounded-full flex items-center justify-center text-3xl shadow-lg border-4 ${
          active ? 'border-purple-500 bg-purple-100 animate-bounce' : 'border-purple-200 bg-purple-50'
        }`}>
        👩‍🏫
      </div>
      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-400'}`}>
        Teacher
      </span>
    </div>
  )
}

function StudentAvatar({ label = 'Student', active, size = 56, emoji = '👦' }: { label?: string; active?: boolean; size?: number; emoji?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 transition-all ${active ? 'scale-115' : ''}`}>
      <div style={{ width: size, height: size }}
        className={`rounded-full flex items-center justify-center text-3xl shadow-lg border-4 ${
          active ? 'border-blue-500 bg-blue-100 animate-bounce' : 'border-blue-200 bg-blue-50'
        }`}>
        {emoji}
      </div>
      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-400'}`}>
        {label}
      </span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

// Flow: vocab → lesson (speak & repeat) → dialogue → quiz (day 2+) → complete (counts revision)
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

  function speak(text: string, role: 'teacher' | 'student' = 'teacher') {
    setSpeaking(true)
    speakAs(text, role)
    const dur = Math.max(1500, text.length * 75 + 800)
    setTimeout(() => setSpeaking(false), dur)
  }

  function startDialoguePlayback(lines: { speaker: string; text: string }[]) {
    window.speechSynthesis?.cancel()
    let delay = 0
    lines.forEach((line, i) => {
      const role = isTeacher(line.speaker) ? 'teacher' : 'student'
      setTimeout(() => setActiveLine(i), delay)
      setTimeout(() => speakAs(line.text, role), delay + 150)
      delay += Math.max(1800, line.text.length * 78 + 1000)
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

  const tabs = (['vocab', 'lesson', 'dialogue', 'quiz'] as Phase[])
    .filter(p => !(p === 'quiz' && chapter.day === 1))
  const tabLabels: Record<string, string> = {
    vocab: '📚 Words', lesson: '🗣️ Speak', dialogue: '💬 Talk', quiz: '📝 Quiz'
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

      {/* Phase tabs — only already-visited tabs are tappable */}
      <div className="flex bg-white border-b border-gray-100 px-2 pt-2 gap-1">
        {tabs.map((p, i) => {
          const phaseOrder = tabs.indexOf(phase)
          const visited = i <= phaseOrder
          return (
            <button key={p} onClick={() => visited && setPhase(p)} disabled={!visited}
              className={`flex-1 py-2 text-xs font-bold rounded-t-lg transition ${
                phase === p ? 'bg-indigo-600 text-white' :
                visited ? 'text-gray-500 hover:bg-gray-100' :
                'text-gray-300 cursor-not-allowed'
              }`}>
              {tabLabels[p]}
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-auto">

        {phase === 'vocab' && (
          <VocabPhase chapter={chapter} index={vocabIndex} speaking={speaking} onSpeak={speak}
            onNext={() => { if (vocabIndex < chapter.vocabulary.length - 1) setVocabIndex(i => i + 1); else setPhase('lesson') }}
            onPrev={() => setVocabIndex(i => Math.max(0, i - 1))} />
        )}

        {phase === 'lesson' && (
          <RepeatPhase
            chapter={chapter}
            index={sentenceIndex}
            onSpeak={speak}
            onNext={() => {
              if (sentenceIndex < chapter.sentences.length - 1) setSentenceIndex(i => i + 1)
              else setPhase('dialogue')
            }}
            onPrev={() => setSentenceIndex(i => Math.max(0, i - 1))}
          />
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
            onGoBack={() => navigate('/dashboard')}
            onRepeat={() => {
              setPhase('vocab')
              setVocabIndex(0)
              setSentenceIndex(0)
              setDialogueIndex(0)
              setActiveLine(-1)
              setQuizIndex(0)
              setQuizScore(0)
              setSelectedAnswer(null)
              setQuiz([])
            }} />
        )}
      </div>
    </div>
  )
}

// ── VocabPhase ────────────────────────────────────────────────────────────────

function VocabPhase({ chapter, index, speaking, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number; speaking: boolean
  onSpeak: (t: string, r: 'teacher' | 'student') => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.vocabulary[index]
  const isLast = index === chapter.vocabulary.length - 1
  useEffect(() => { onSpeak(item.word, 'teacher') }, [index])

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      <TeacherAvatar active={speaking} size={64} />
      <ProgressBar current={index + 1} total={chapter.vocabulary.length} label="Vocabulary" />
      <button className="bg-white rounded-3xl shadow-lg p-8 w-full border-2 border-indigo-100 text-center active:scale-95 transition-transform"
        onClick={() => onSpeak(item.word, 'teacher')}>
        {item.emoji && <div className="text-6xl mb-3">{item.emoji}</div>}
        <p className="text-3xl font-black text-indigo-700">{item.word}</p>
        <p className="text-sm text-gray-400 mt-2">🔊 Tap to hear again</p>
      </button>
      <div className="flex gap-3 w-full">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">← Back</button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? 'Start Speaking →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── RepeatPhase (speak-and-repeat) ────────────────────────────────────────────

type RepeatState = 'playing' | 'waiting' | 'listening' | 'correct' | 'wrong'

function RepeatPhase({ chapter, index, onSpeak, onNext, onPrev }: {
  chapter: ChapterData; index: number
  onSpeak: (t: string, r: 'teacher' | 'student') => void; onNext: () => void; onPrev: () => void
}) {
  const item = chapter.sentences[index]
  const role = getSpeakerRole(item.text)
  const isStudent = role === 'student'
  const isLast = index === chapter.sentences.length - 1
  const [state, setState] = useState<RepeatState>('playing')
  const [heardText, setHeardText] = useState('')

  // Auto-play when sentence changes
  useEffect(() => {
    setState('playing')
    setHeardText('')
    const dur = Math.max(1500, item.text.length * 78 + 800)
    onSpeak(item.text, role)
    const timer = setTimeout(() => setState('waiting'), dur)
    return () => clearTimeout(timer)
  }, [index])

  function listenForRepeat() {
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { alert('Please use Chrome on Android for speech.'); return }

    setState('listening')
    const rec = new SR()
    rec.lang = 'en-US'  // Student repeats IN ENGLISH
    rec.interimResults = false
    rec.maxAlternatives = 3

    rec.onresult = (event: any) => {
      const alts: string[] = []
      for (let i = 0; i < event.results[0].length; i++) alts.push(event.results[0][i].transcript)
      const heard = alts[0] ?? ''
      setHeardText(heard)
      const matched = alts.some(a => isGoodMatch(a, item.text))
      setState(matched ? 'correct' : 'wrong')
      if (matched) {
        speakAs('Very good!', 'teacher')
        setTimeout(onNext, 1400)
      }
    }
    rec.onerror = () => setState('waiting')
    rec.onend = () => { if (state === 'listening') setState('waiting') }
    rec.start()
  }

  function replay() {
    setState('playing')
    setHeardText('')
    onSpeak(item.text, role)
    const dur = Math.max(1500, item.text.length * 78 + 800)
    setTimeout(() => setState('waiting'), dur)
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
      {/* Both avatars — active one bounces */}
      <div className="flex gap-8 items-end justify-center py-2">
        <TeacherAvatar active={!isStudent && state === 'playing'} size={64} />
        <StudentAvatar active={isStudent && state === 'playing' || state === 'listening' || state === 'correct' || state === 'wrong'} size={64} />
      </div>

      <ProgressBar current={index + 1} total={chapter.sentences.length} label="Speak & Repeat" />

      {/* Sentence card */}
      <div className={`bg-white rounded-3xl shadow-lg p-6 w-full border-2 text-center ${isStudent ? 'border-blue-200' : 'border-purple-200'}`}>
        <div className={`text-xs font-black mb-2 px-3 py-1 rounded-full inline-block ${isStudent ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
          {isStudent ? '👦 Student says' : '👩‍🏫 Teacher says'}
        </div>
        {item.emoji && <div className="text-5xl mb-2">{item.emoji}</div>}
        <p className="text-2xl font-black text-gray-800 leading-relaxed">{item.text}</p>
      </div>

      {/* Status feedback */}
      {state === 'playing' && (
        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm animate-pulse">
          🔊 Listen carefully…
        </div>
      )}
      {state === 'waiting' && (
        <div className="text-indigo-600 font-black text-base text-center">
          Now YOU say it! 👆<br/>
          <span className="text-sm font-semibold text-gray-500">Say it out loud in English</span>
        </div>
      )}
      {state === 'listening' && (
        <div className="text-red-500 font-black text-base animate-pulse text-center">
          🎤 Listening… say it now!
        </div>
      )}
      {state === 'correct' && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl px-4 py-3 w-full text-center">
          <p className="text-green-700 font-black text-xl">🌟 Excellent!</p>
          <p className="text-green-600 text-sm">I heard: "{heardText}"</p>
        </div>
      )}
      {state === 'wrong' && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl px-4 py-3 w-full text-center">
          <p className="text-red-700 font-black text-base">Try again! I heard: "{heardText}"</p>
          <p className="text-red-500 text-sm">Listen again and repeat the exact sentence</p>
        </div>
      )}

      {/* Action buttons — NO skip, student must say it */}
      <div className="flex gap-3 w-full">
        <button onClick={replay}
          className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-4 touch-target">
          🔊 Replay
        </button>
        {(state === 'waiting' || state === 'wrong') && (
          <button onClick={listenForRepeat}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl py-4 touch-target text-lg">
            🎤 I'll Say It!
          </button>
        )}
        {state === 'listening' && (
          <div className="flex-1 bg-red-500 text-white font-black rounded-xl py-4 text-center animate-pulse">
            🎤 Listening…
          </div>
        )}
        {state === 'playing' && (
          <div className="flex-1 bg-gray-200 text-gray-400 font-black rounded-xl py-4 text-center">
            🔊 Listen first…
          </div>
        )}
      </div>
      {/* Prev only — no skip forward */}
      <button onClick={onPrev} disabled={index === 0}
        className="text-gray-400 text-sm font-semibold disabled:opacity-20 py-1">← Previous sentence</button>
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

      {/* Character scene */}
      <div className="flex justify-around items-end bg-gradient-to-b from-sky-100 to-green-50 rounded-2xl p-4 border-2 border-sky-200">
        {dialogue.lines.some(l => isTeacher(l.speaker)) && (
          <TeacherAvatar active={activeLine >= 0 && isTeacher(dialogue.lines[activeLine]?.speaker)} size={64} />
        )}
        {dialogue.lines
          .filter(l => !isTeacher(l.speaker))
          .filter((l, i, arr) => arr.findIndex(x => x.speaker === l.speaker) === i)
          .map(l => {
            const emoji = l.speaker.toLowerCase().includes('b') || l.speaker.includes('2') ? '👧' : '👦'
            return (
              <StudentAvatar key={l.speaker} label={l.speaker} emoji={emoji} size={64}
                active={activeLine >= 0 && dialogue.lines[activeLine]?.speaker === l.speaker} />
            )
          })}
      </div>

      {/* Chat bubbles */}
      <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-purple-100 space-y-3">
        {dialogue.lines.map((line, i) => {
          const teacher = isTeacher(line.speaker)
          const active = activeLine === i
          return (
            <div key={i} className={`flex gap-3 items-start ${!teacher ? 'flex-row-reverse' : ''}`}>
              <span className={`text-2xl shrink-0 transition-transform ${active ? 'scale-125' : ''}`}>
                {teacher ? '👩‍🏫' : (line.speaker.toLowerCase().includes('b') || line.speaker.includes('2') ? '👧' : '👦')}
              </span>
              <div className={`flex-1 rounded-2xl px-3 py-2 transition-all border ${
                teacher
                  ? active ? 'bg-purple-100 border-purple-400 shadow' : 'bg-purple-50 border-purple-100'
                  : active ? 'bg-blue-100 border-blue-400 shadow' : 'bg-blue-50 border-blue-100'
              } ${!teacher ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                <p className={`text-xs font-black mb-0.5 ${teacher ? 'text-purple-600' : 'text-blue-600'}`}>{line.speaker}</p>
                <p className={`font-bold text-gray-800 ${active ? 'text-base' : 'text-sm'}`}>{line.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={onPlay}
        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-3 touch-target text-lg shadow">
        ▶️ Play Dialogue
      </button>
      <div className="flex gap-3">
        <button onClick={onPrev} disabled={index === 0}
          className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-xl py-4 disabled:opacity-30 touch-target">← Back</button>
        <button onClick={onNext}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 touch-target">
          {isLast ? (chapter.day === 1 ? 'Finish →' : 'Take Quiz →') : 'Next →'}
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
          <><div className="text-7xl mb-3">{question.blankedSentence}</div>
            <p className="font-bold text-gray-600">What does this mean in English?</p></>
        ) : (
          <><p className="text-sm text-gray-500 font-semibold mb-2">Choose the correct word:</p>
            <p className="text-xl font-black text-gray-800">{question.blankedSentence}</p></>
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
            selectedAnswer === question.answer ? 'bg-green-50 text-green-700 border-2 border-green-400' : 'bg-red-50 text-red-700 border-2 border-red-400'
          }`}>
            {selectedAnswer === question.answer ? '🎉 Correct!' : `❌ Answer: "${question.answer}"`}
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

// ── CompletePhase — counts revision here (student has spoken all sentences) ───

function CompletePhase({ score, total, currentRevisions, studentId, dayKey, onGoBack, onRepeat }: {
  score: number; total: number; currentRevisions: number
  studentId: string; dayKey: string; onGoBack: () => void; onRepeat: () => void
}) {
  const [saving, setSaving] = useState(true)
  const [newRevisions, setNewRevisions] = useState(currentRevisions)

  useEffect(() => {
    incrementRevision(studentId, dayKey)
      .then(p => setNewRevisions(p.revision_count))
      .catch(console.error)
      .finally(() => setSaving(false))
  }, [])

  const pct = total > 0 ? Math.round((score / total) * 100) : 100

  return (
    <div className="flex flex-col items-center gap-5 max-w-lg mx-auto w-full py-6">
      <div className="text-7xl">{pct >= 80 ? '🌟' : pct >= 50 ? '😊' : '💪'}</div>
      <h2 className="font-black text-2xl text-gray-800 text-center">
        {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good job!' : 'Keep practising!'}
      </h2>
      {total > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 w-full text-center border-2 border-green-200">
          <p className="text-4xl font-black text-green-600">{score}<span className="text-xl text-gray-400">/{total}</span></p>
          <p className="text-gray-500 font-semibold mt-1">Quiz Score</p>
        </div>
      )}
      <div className="bg-indigo-50 rounded-2xl p-4 w-full text-center border border-indigo-200">
        {saving ? (
          <p className="text-indigo-400 text-sm">Saving progress…</p>
        ) : (
          <>
            <p className="text-indigo-700 font-black text-xl">{newRevisions}/10 Revisions</p>
            <p className="text-indigo-500 text-sm mt-1">
              {newRevisions < 10
                ? `${10 - newRevisions} more to unlock next day!`
                : '🎉 All done! Next day unlocks tomorrow.'}
            </p>
            <ProgressBar current={Math.min(newRevisions, 10)} total={10} label="" />
          </>
        )}
      </div>
      <button onClick={onRepeat}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl py-4 text-lg shadow-lg touch-target">
        🔄 Repeat this Lesson
      </button>
      <button onClick={onGoBack}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl py-4 text-lg shadow-lg touch-target">
        ← Back to Dashboard
      </button>
    </div>
  )
}
