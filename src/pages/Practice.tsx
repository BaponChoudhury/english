import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapterById } from '../lib/supabase'
import { Chapter } from '../types'
import { translateToEnglish, speakText, SupportedLanguage, LANGUAGE_NAMES } from '../lib/translation'
import { TranslationResult } from '../lib/translation'
import AnimatedCharacter from '../components/AnimatedCharacter'
import SpeechInput from '../components/SpeechInput'

export default function Practice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<SupportedLanguage>('hi')
  const [translation, setTranslation] = useState<TranslationResult | null>(null)
  const [translating, setTranslating] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const [translationError, setTranslationError] = useState('')

  useEffect(() => {
    if (!id) return
    getChapterById(id)
      .then(c => setChapter(c))
      .catch(() => setSpeechError('Failed to load chapter.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleTranscript(text: string) {
    setTranslationError('')
    setTranslating(true)
    try {
      const result = await translateToEnglish(text, language)
      setTranslation(result)
      // Auto-speak the English translation
      speakText(result.translatedText)
    } catch (err) {
      setTranslationError('Translation failed. Please try again.')
      console.error(err)
    } finally {
      setTranslating(false)
    }
  }

  function handleSpeakAgain() {
    if (translation) speakText(translation.translatedText)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        <button
          onClick={() => { window.speechSynthesis?.cancel(); navigate(`/chapter/${id}`) }}
          className="text-2xl touch-target flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-green-200">Practice Mode</p>
          <h1 className="font-black truncate">{chapter?.title ?? 'Practice'}</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-green-200 hover:text-white text-sm font-bold px-2 py-1 rounded-lg touch-target"
        >
          Home
        </button>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full overflow-auto">
        <div className="flex justify-center">
          <AnimatedCharacter size={120} speaking={translating} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow border border-green-100">
          <p className="text-center text-gray-600 font-semibold text-sm">
            Speak a sentence in your language and see the English translation!
          </p>
        </div>

        {/* Language picker */}
        <div className="bg-white rounded-2xl p-4 shadow border border-green-100">
          <p className="text-sm font-black text-gray-700 mb-2">Speak in:</p>
          <div className="flex gap-3">
            {(['hi', 'bn'] as SupportedLanguage[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-3 rounded-xl font-black text-sm transition-all touch-target ${
                  language === lang
                    ? 'bg-green-600 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {LANGUAGE_NAMES[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Mic input */}
        <div className="bg-white rounded-2xl p-6 shadow border border-green-100 flex flex-col items-center">
          <SpeechInput
            language={language}
            onTranscript={handleTranscript}
            onError={setSpeechError}
            disabled={translating}
          />
          {speechError && (
            <p className="text-red-600 text-sm font-semibold mt-3 text-center">{speechError}</p>
          )}
        </div>

        {/* Translation result */}
        {translating && (
          <div className="bg-white rounded-2xl p-5 shadow border border-green-100 text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Translating...</p>
          </div>
        )}

        {translationError && !translating && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold text-center">
            {translationError}
          </div>
        )}

        {translation && !translating && (
          <div className="bg-white rounded-2xl p-5 shadow border-2 border-green-200 space-y-4">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">
                You said ({LANGUAGE_NAMES[translation.sourceLang]}):
              </p>
              <p className="text-base font-bold text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                {translation.originalText}
              </p>
            </div>

            <div>
              <p className="text-xs font-black text-green-500 uppercase tracking-wide mb-1">
                In English:
              </p>
              <p className="text-xl font-black text-green-800 bg-green-50 rounded-xl px-3 py-3 leading-snug">
                {translation.translatedText}
              </p>
            </div>

            <button
              onClick={handleSpeakAgain}
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-3 shadow touch-target"
            >
              🔊 Speak Again
            </button>
          </div>
        )}

        {/* Sentence reference */}
        {chapter?.content && chapter.content.length > 0 && (
          <div className="bg-indigo-50 rounded-2xl p-4 shadow border border-indigo-100">
            <p className="text-xs font-black text-indigo-500 mb-2 uppercase tracking-wide">
              Today's sentences (for reference):
            </p>
            <ul className="space-y-2">
              {chapter.content.map((sentence, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-indigo-400 font-black text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-indigo-800 font-semibold flex-1">{sentence}</p>
                  <button
                    onClick={() => speakText(sentence)}
                    className="text-indigo-400 hover:text-indigo-600 text-base shrink-0 touch-target flex items-center justify-center"
                    aria-label="Play"
                  >
                    🔊
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
