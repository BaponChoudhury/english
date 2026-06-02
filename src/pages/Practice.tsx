import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CHAPTERS } from '../data/chapters'
import { translateToEnglish, speakAs, getSpeakerRole, SupportedLanguage, LANGUAGE_NAMES } from '../lib/translation'
import { incrementRevision } from '../lib/supabase'
import { StudentSession } from '../types'

// Normalise text for loose matching (remove punctuation, lowercase)
function normalise(text: string) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
}

// Check if spoken text roughly matches the target sentence
function isGoodMatch(spoken: string, target: string): boolean {
  const s = normalise(spoken)
  const t = normalise(target)
  if (s === t) return true
  // Accept if most key words are present
  const targetWords = t.split(' ').filter(w => w.length > 2)
  if (targetWords.length === 0) return s.includes(t)
  const matched = targetWords.filter(w => s.includes(w))
  return matched.length >= Math.ceil(targetWords.length * 0.6)
}

type LineStatus = 'pending' | 'listening' | 'done' | 'skipped'

interface SentenceState {
  text: string
  emoji?: string
  status: LineStatus
  heardText: string
}

export default function Practice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chapter = CHAPTERS.find(c => c.day === Number(id)) ?? null

  const [language, setLanguage] = useState<SupportedLanguage>('hi')
  const [sentences, setSentences] = useState<SentenceState[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [listening, setListening] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [session] = useState<StudentSession | null>(() => {
    try { return JSON.parse(localStorage.getItem('student_session') ?? 'null') } catch { return null }
  })

  useEffect(() => {
    if (!chapter) { navigate('/dashboard'); return }
    setSentences(chapter.sentences.map(s => ({ text: s.text, emoji: s.emoji, status: 'pending', heardText: '' })))
  }, [id])

  // Auto-play current sentence TTS
  useEffect(() => {
    if (sentences.length > 0 && currentIdx < sentences.length) {
      const role = getSpeakerRole(sentences[currentIdx].text)
      speakAs(sentences[currentIdx].text, role)
    }
  }, [currentIdx, sentences.length])

  function startListening() {
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported. Please use Chrome on Android.'); return }

    const rec = new SR()
    rec.lang = language === 'hi' ? 'hi-IN' : 'bn-BD'
    rec.interimResults = false
    rec.maxAlternatives = 3

    setListening(true)

    rec.onresult = async (event: any) => {
      setListening(false)
      // Collect all alternatives
      const alternatives: string[] = []
      for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript)
      }

      const target = sentences[currentIdx].text
      let translatedBest = ''
      let matched = false

      // Try to translate each alternative and check if it matches
      for (const alt of alternatives) {
        try {
          const result = await translateToEnglish(alt, language)
          if (isGoodMatch(result.translatedText, target)) {
            translatedBest = result.translatedText
            matched = true
            break
          }
          if (!translatedBest) translatedBest = result.translatedText
        } catch {
          // ignore individual translation failures
        }
      }

      markSentence(currentIdx, matched ? 'done' : 'pending', alternatives[0] ?? '', translatedBest)
      if (matched) speakAs('Very good!', 'teacher')
    }

    rec.onerror = (event: any) => {
      setListening(false)
      if (event.error !== 'aborted') alert(`Mic error: ${event.error}. Make sure microphone is allowed.`)
    }

    rec.onend = () => setListening(false)
    rec.start()
  }

  function markSentence(idx: number, status: LineStatus, heardText: string, _translated = '') {
    setSentences(prev => {
      const updated = prev.map((s, i) => i === idx ? { ...s, status, heardText } : s)
      const allDone = updated.every(s => s.status === 'done' || s.status === 'skipped')
      if (allDone && !completed) handleComplete()
      return updated
    })
    if (status === 'done' || status === 'skipped') {
      const next = idx + 1
      if (next < sentences.length) setCurrentIdx(next)
    }
  }

  async function handleComplete() {
    setCompleted(true)
    if (!session) return
    setSaving(true)
    try {
      await incrementRevision(session.id, `day-${chapter?.day}`)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  function skipCurrent() {
    markSentence(currentIdx, 'skipped', '')
  }

  function replay() {
    const role = getSpeakerRole(sentences[currentIdx].text)
    speakAs(sentences[currentIdx].text, role)
  }

  if (!chapter) return null

  const doneCount = sentences.filter(s => s.status === 'done').length
  const total = sentences.length

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-7xl">🌟</div>
        <h2 className="font-black text-2xl text-gray-800 text-center">Practice Complete!</h2>
        <div className="bg-white rounded-2xl shadow p-6 w-full max-w-sm text-center border-2 border-green-200">
          <p className="text-4xl font-black text-green-600">{doneCount}/{total}</p>
          <p className="text-gray-500 font-semibold mt-1">Sentences spoken correctly</p>
        </div>
        {saving && <p className="text-gray-400 text-sm">Saving revision…</p>}
        <button onClick={() => navigate('/dashboard')}
          className="w-full max-w-sm bg-indigo-600 text-white font-black rounded-xl py-4 text-lg touch-target">
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  const current = sentences[currentIdx]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col">
      <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        <button onClick={() => { window.speechSynthesis?.cancel(); navigate(`/chapter/${id}`) }}
          className="text-2xl touch-target w-10 flex items-center justify-center">←</button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-green-200">Speak Practice · Day {chapter.day}</p>
          <h1 className="font-black truncate">{chapter.title}</h1>
        </div>
        <div className="text-xs text-green-200 font-bold">{doneCount}/{total}</div>
      </header>

      {/* Language picker */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 items-center">
        <span className="text-xs font-bold text-gray-500">Speak in:</span>
        {(['hi', 'bn'] as SupportedLanguage[]).map(lang => (
          <button key={lang} onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded-full text-xs font-black transition ${language === lang ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {LANGUAGE_NAMES[lang]}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">

        {/* Progress dots */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {sentences.map((s, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${
              s.status === 'done' ? 'bg-green-500' :
              s.status === 'skipped' ? 'bg-gray-300' :
              i === currentIdx ? 'bg-indigo-600 scale-125' : 'bg-gray-200'
            }`} />
          ))}
        </div>

        {/* Current sentence card */}
        {current && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100 text-center">
            {current.emoji && <div className="text-5xl mb-2">{current.emoji}</div>}
            <p className="text-2xl font-black text-gray-800 mb-1">{current.text}</p>
            <p className="text-xs text-gray-400 font-semibold">Say this in {LANGUAGE_NAMES[language]}!</p>
          </div>
        )}

        {/* Heard text feedback */}
        {current?.heardText && current.status === 'pending' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold text-center">
            I heard: "{current.heardText}" — try again! 🔁
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={listening ? undefined : startListening}
            disabled={listening}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all touch-target ${
              listening ? 'bg-red-500 animate-pulse scale-110' : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}>
            {listening ? '🛑' : '🎤'}
          </button>
          <p className="text-sm font-bold text-gray-600">
            {listening ? `Listening… speak in ${LANGUAGE_NAMES[language]}` : 'Tap mic and speak!'}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={replay}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-3 touch-target">
            🔊 Hear Again
          </button>
          <button onClick={skipCurrent}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl py-3 touch-target">
            Skip →
          </button>
        </div>

        {/* Sentence checklist */}
        <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase mb-2">All sentences</p>
          <div className="space-y-2">
            {sentences.map((s, i) => (
              <button key={i} onClick={() => { setCurrentIdx(i); const role = getSpeakerRole(s.text); speakAs(s.text, role) }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  i === currentIdx ? 'bg-indigo-50 border-2 border-indigo-400' :
                  s.status === 'done' ? 'bg-green-50 text-green-700' :
                  s.status === 'skipped' ? 'bg-gray-50 text-gray-400 line-through' : 'bg-gray-50 text-gray-700'
                }`}>
                <span>{s.status === 'done' ? '✅' : s.status === 'skipped' ? '⏭' : s.emoji ?? '▶️'}</span>
                <span className="flex-1 truncate">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
