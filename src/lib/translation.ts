export type SupportedLanguage = 'hi' | 'bn'

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  hi: 'Hindi',
  bn: 'Bengali'
}

export const SPEECH_LANG_CODES: Record<SupportedLanguage, string> = {
  hi: 'hi-IN',
  bn: 'bn-BD'   // BD gives better results for Sylheti dialect
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLang: SupportedLanguage
}

export async function translateToEnglish(
  text: string,
  sourceLang: SupportedLanguage
): Promise<TranslationResult> {
  const langPair = `${sourceLang}|en`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Translation API error: ${response.status}`)

  const data = await response.json()
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed')

  return {
    originalText: text,
    translatedText: data.responseData.translatedText,
    sourceLang
  }
}

// Detect if a sentence is spoken by teacher or student based on content
export function getSpeakerRole(text: string): 'teacher' | 'student' {
  const t = text.toLowerCase()
  // Student speaks when addressing teacher/family
  if (/\bteacher\b|\bsir\b|\bmiss\b|\bmadam\b/.test(t)) return 'student'
  if (/\bpapa\b|\bmama\b|\bfather\b|\bmother\b|\buncle\b|\baunt\b|\bgrandpa\b|\bgrandma\b/.test(t)) return 'student'
  // Student gives responses
  if (/^(yes!?|no!?|i am|my name is|i have|i love|i want|fine|happy|good morning teacher|hello teacher|hi teacher|goodbye teacher|good night|good evening|good afternoon)/.test(t)) return 'student'
  // Teacher addresses the class
  if (/children|class\b|everyone|to all/.test(t)) return 'teacher'
  return 'teacher'
}

export function speakAs(text: string, role: 'teacher' | 'student' = 'teacher'): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'

  const applyVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const enVoices = voices.filter(v => v.lang.startsWith('en'))

    if (role === 'teacher') {
      utterance.rate = 0.78
      utterance.pitch = 1.0
      // Prefer a female voice for teacher
      const femaleVoice = enVoices.find(v =>
        /zira|susan|karen|moira|tessa|samantha|victoria|fiona|alice|google uk english female/i.test(v.name)
      ) || enVoices.find(v => /female|woman/i.test(v.name))
      if (femaleVoice) utterance.voice = femaleVoice
    } else {
      // Student: higher pitch = child-like voice
      utterance.rate = 0.88
      utterance.pitch = 1.6
      const maleVoice = enVoices.find(v =>
        /david|mark|daniel|google uk english male|rishi/i.test(v.name)
      )
      if (maleVoice) utterance.voice = maleVoice
    }
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', applyVoice, { once: true })
  } else {
    applyVoice()
  }
}

// Keep speakText for backwards compatibility
export function speakText(text: string, lang = 'en-US'): void {
  speakAs(text, 'teacher')
}
