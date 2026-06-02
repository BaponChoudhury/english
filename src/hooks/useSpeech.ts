import { useState, useRef, useCallback } from 'react'
import { SupportedLanguage, SPEECH_LANG_CODES } from '../lib/translation'

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'error'

interface UseSpeechOptions {
  language: SupportedLanguage
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

export function useSpeech({ language, onResult, onError }: UseSpeechOptions) {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser. Please use Chrome on Android.')
      return
    }

    const SpeechRecognitionClass =
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ||
      window.SpeechRecognition

    const recognition = new SpeechRecognitionClass()
    recognition.lang = SPEECH_LANG_CODES[language]
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setStatus('listening')
      setInterimTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      setInterimTranscript(interim)
      if (final) {
        setStatus('processing')
        onResult(final.trim())
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setStatus('error')
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone permission denied. Please allow microphone access.',
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error during speech recognition.',
        'aborted': 'Speech recognition was stopped.'
      }
      onError?.(messages[event.error] || `Speech error: ${event.error}`)
    }

    recognition.onend = () => {
      setStatus('idle')
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, isSupported, onResult, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  return {
    status,
    interimTranscript,
    isSupported,
    startListening,
    stopListening
  }
}
