import { useSpeech } from '../hooks/useSpeech'
import { SupportedLanguage, LANGUAGE_NAMES } from '../lib/translation'

interface SpeechInputProps {
  language: SupportedLanguage
  onTranscript: (text: string) => void
  onError?: (msg: string) => void
  disabled?: boolean
}

export default function SpeechInput({
  language,
  onTranscript,
  onError,
  disabled = false
}: SpeechInputProps) {
  const { status, interimTranscript, isSupported, startListening, stopListening } = useSpeech({
    language,
    onResult: onTranscript,
    onError
  })

  const isListening = status === 'listening'
  const isProcessing = status === 'processing'

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-amber-700 font-semibold text-sm">
          Speech recognition is not supported in this browser.
        </p>
        <p className="text-amber-600 text-xs mt-1">Please use Chrome on Android for best experience.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isProcessing}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg
          transition-all duration-200 touch-target
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
            : isProcessing
            ? 'bg-yellow-400 cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }
          disabled:opacity-50
        `}
        aria-label={isListening ? 'Stop listening' : `Speak in ${LANGUAGE_NAMES[language]}`}
      >
        {isListening ? '⏹' : isProcessing ? '⏳' : '🎤'}
      </button>

      <div className="text-center">
        {isListening && (
          <p className="text-red-600 font-bold text-sm animate-pulse">
            Listening... speak now in {LANGUAGE_NAMES[language]}
          </p>
        )}
        {isProcessing && (
          <p className="text-yellow-600 font-bold text-sm">Processing...</p>
        )}
        {!isListening && !isProcessing && (
          <p className="text-gray-500 text-sm">
            Tap to speak in {LANGUAGE_NAMES[language]}
          </p>
        )}
      </div>

      {interimTranscript && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full text-center">
          <p className="text-gray-600 text-sm italic">{interimTranscript}</p>
        </div>
      )}
    </div>
  )
}
