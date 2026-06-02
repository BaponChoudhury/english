export interface School {
  id: string
  name: string
  joining_code: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  class: string
  joining_code: string
  created_at: string
}

export interface Chapter {
  id: string
  day_number: number
  title: string
  content: string[] | null
  pdf_url: string | null
  school_joining_code: string
  created_at: string
}

export interface Progress {
  id: string
  student_id: string
  day_key: string
  revision_count: number
  last_revised_at: string | null
}

export interface StudentSession {
  id: string
  name: string
  class: string
  joining_code: string
}

export interface ChapterWithProgress extends Chapter {
  progress: Progress | null
  isUnlocked: boolean
}

export interface QuizQuestion {
  sentence: string
  blankedSentence: string
  answer: string
  options: string[]
}
