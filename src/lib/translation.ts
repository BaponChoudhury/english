export type SupportedLanguage = 'hi' | 'bn'

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  hi: 'Hindi',
  bn: 'Bengali'
}

export const SPEECH_LANG_CODES: Record<SupportedLanguage, string> = {
  hi: 'hi-IN',
  bn: 'bn-IN'
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
  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation failed')
  }

  return {
    originalText: text,
    translatedText: data.responseData.translatedText,
    sourceLang
  }
}

export function speakText(text: string, lang = 'en-US'): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.82
  utterance.pitch = 1.1

  const doSpeak = () => window.speechSynthesis.speak(utterance)
  // On Android Chrome, voices load asynchronously — wait for them if needed
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
  } else {
    doSpeak()
  }
}
