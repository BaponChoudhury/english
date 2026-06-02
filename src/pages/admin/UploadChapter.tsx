import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, getSchoolsForAdmin, uploadChapterPDF, createChapter } from '../../lib/supabase'
import { School } from '../../types'

async function extractTextFromPDF(file: File): Promise<string[]> {
  // Dynamically import pdfjs-dist to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist')
  // Use a CDN worker to avoid bundling issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const allText: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => 'str' in item && typeof item.str === 'string')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str as string)
      .join(' ')
      .trim()

    // Split into sentences
    const sentences = pageText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)

    allText.push(...sentences)
  }

  return allText
}

export default function UploadChapter() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [dayNumber, setDayNumber] = useState(1)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [manualText, setManualText] = useState('')
  const [inputMode, setInputMode] = useState<'pdf' | 'manual'>('pdf')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/admin')
        return
      }
      getSchoolsForAdmin().then(data => {
        setSchools(data)
        if (data.length > 0) setSelectedSchool(data[0].joining_code)
      })
    })
  }, [navigate])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview([])
    setError('')

    setExtracting(true)
    try {
      const sentences = await extractTextFromPDF(f)
      setPreview(sentences)
    } catch (err) {
      setError('Failed to extract text from PDF. You can type it manually below.')
      setInputMode('manual')
      console.error(err)
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedSchool) {
      setError('Please select a school.')
      return
    }
    if (!title.trim()) {
      setError('Please enter a chapter title.')
      return
    }

    const sentences = inputMode === 'pdf'
      ? preview
      : manualText.split('\n').map(s => s.trim()).filter(s => s.length > 0)

    if (sentences.length === 0) {
      setError('No content to save. Please upload a PDF or enter text manually.')
      return
    }

    setLoading(true)
    try {
      let pdfUrl = ''
      if (file && inputMode === 'pdf') {
        pdfUrl = await uploadChapterPDF(file, selectedSchool)
      }
      await createChapter(dayNumber, title.trim(), sentences, pdfUrl, selectedSchool)
      setSuccess(`Chapter "${title}" saved for Day ${dayNumber}!`)
      setTitle('')
      setFile(null)
      setPreview([])
      setManualText('')
      setDayNumber(prev => prev + 1)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-2xl touch-target flex items-center justify-center">←</Link>
        <div>
          <h1 className="font-black text-lg">Upload Chapter</h1>
          <p className="text-gray-400 text-xs">Add a new day's lesson</p>
        </div>
      </header>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <label className="block text-sm font-bold text-gray-700 mb-1">School</label>
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-indigo-500 bg-white"
            >
              {schools.map(s => (
                <option key={s.id} value={s.joining_code}>{s.name} ({s.joining_code})</option>
              ))}
            </select>
          </div>

          {/* Day + Title */}
          <div className="bg-white rounded-2xl p-4 shadow space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Day Number</label>
              <input
                type="number"
                min={1}
                value={dayNumber}
                onChange={e => setDayNumber(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chapter Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Greetings and Introductions"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Input mode toggle */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${
                  inputMode === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                📄 Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${
                  inputMode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                ✏️ Type Manually
              </button>
            </div>

            {inputMode === 'pdf' && (
              <div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold hover:file:bg-indigo-700 cursor-pointer"
                />
                {extracting && (
                  <div className="mt-3 flex items-center gap-2 text-indigo-600">
                    <div className="w-5 h-5 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold">Extracting text from PDF...</span>
                  </div>
                )}
              </div>
            )}

            {inputMode === 'manual' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Enter sentences (one per line)
                </label>
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="Hello, my name is Ravi.&#10;I am in Class 7.&#10;I like to play cricket."
                  rows={8}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-indigo-500 resize-y"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {manualText.split('\n').filter(s => s.trim().length > 0).length} sentences
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && inputMode === 'pdf' && (
            <div className="bg-white rounded-2xl p-4 shadow">
              <p className="text-sm font-black text-gray-700 mb-2">
                Extracted {preview.length} sentences (preview):
              </p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {preview.slice(0, 20).map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <span className="font-bold text-gray-400 mr-1">{i + 1}.</span>{s}
                  </li>
                ))}
                {preview.length > 20 && (
                  <li className="text-xs text-gray-400 text-center py-1">
                    ...and {preview.length - 20} more
                  </li>
                )}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || extracting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl py-4 shadow-lg disabled:opacity-60 transition touch-target"
          >
            {loading ? 'Saving...' : 'Save Chapter'}
          </button>
        </form>
      </div>
    </div>
  )
}
