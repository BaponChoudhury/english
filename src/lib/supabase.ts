import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Student operations
export async function validateJoiningCode(code: string) {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('joining_code', code.toUpperCase())
    .single()
  if (error) return null
  return data
}

export async function createStudent(name: string, studentClass: string, joiningCode: string) {
  const { data, error } = await supabase
    .from('students')
    .insert({ name, class: studentClass, joining_code: joiningCode.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getOrCreateStudent(name: string, studentClass: string, joiningCode: string) {
  // Check if student with same name and joining code already exists
  const { data: existing } = await supabase
    .from('students')
    .select('*')
    .eq('name', name)
    .eq('joining_code', joiningCode.toUpperCase())
    .eq('class', studentClass)
    .maybeSingle()

  if (existing) return existing
  return createStudent(name, studentClass, joiningCode)
}

// Chapter operations
export async function getChaptersForSchool(joiningCode: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('school_joining_code', joiningCode.toUpperCase())
    .order('day_number', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getChapterById(id: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Progress operations
export async function getProgressForStudent(studentId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
  if (error) throw error
  return data || []
}

export async function getOrCreateProgress(studentId: string, chapterId: string) {
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('chapter_id', chapterId)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('progress')
    .insert({ student_id: studentId, chapter_id: chapterId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function incrementRevision(studentId: string, chapterId: string) {
  const prog = await getOrCreateProgress(studentId, chapterId)
  const newCount = (prog.revision_count || 0) + 1
  const { data, error } = await supabase
    .from('progress')
    .update({ revision_count: newCount, last_revised_at: new Date().toISOString() })
    .eq('id', prog.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unlockNextChapter(studentId: string, nextChapterId: string) {
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('chapter_id', nextChapterId)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase
      .from('progress')
      .insert({ student_id: studentId, chapter_id: nextChapterId, unlocked_at: new Date().toISOString() })
    if (error) throw error
  }
}

// Admin operations
export async function getAllStudentsWithProgress(joiningCode: string) {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('joining_code', joiningCode.toUpperCase())
  if (error) throw error

  const studentsWithProgress = await Promise.all(
    (students || []).map(async (student) => {
      const progress = await getProgressForStudent(student.id)
      return { ...student, progress }
    })
  )
  return studentsWithProgress
}

export async function createSchool(name: string, joiningCode: string) {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name, joining_code: joiningCode.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadChapterPDF(file: File, schoolCode: string) {
  const fileName = `${schoolCode}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from('chapters')
    .upload(fileName, file)
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('chapters')
    .getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function createChapter(
  dayNumber: number,
  title: string,
  content: string[],
  pdfUrl: string,
  schoolCode: string
) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      day_number: dayNumber,
      title,
      content,
      pdf_url: pdfUrl,
      school_joining_code: schoolCode.toUpperCase()
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSchoolsForAdmin() {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
