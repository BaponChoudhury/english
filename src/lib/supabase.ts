import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ── Student operations ────────────────────────────────────────────────────────

export async function validateStudentJoiningCode(code: string) {
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('joining_code', code.toUpperCase())
    .maybeSingle()
  return data ?? null
}

export async function createStudent(name: string, studentClass: string, schoolCode: string) {
  const joiningCode = generateStudentCode()
  const { data, error } = await supabase
    .from('students')
    .insert({ name, class: studentClass, joining_code: joiningCode, school_code: schoolCode.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudent(studentId: string) {
  // Delete progress first (FK constraint), then student
  await supabase.from('progress').delete().eq('student_id', studentId)
  const { error } = await supabase.from('students').delete().eq('id', studentId)
  if (error) throw error
}

function generateStudentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ── Progress operations ───────────────────────────────────────────────────────
// Uses day_key (e.g. "day-1") instead of a UUID FK so no chapters table needed

export async function getProgressForStudent(studentId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
  if (error) throw error
  return data || []
}

export async function getOrCreateProgress(studentId: string, dayKey: string) {
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('day_key', dayKey)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('progress')
    .insert({ student_id: studentId, day_key: dayKey, revision_count: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function incrementRevision(studentId: string, dayKey: string) {
  const prog = await getOrCreateProgress(studentId, dayKey)
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

// ── Admin operations ──────────────────────────────────────────────────────────

export async function getAllStudentsWithProgress(schoolCode: string) {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('school_code', schoolCode.toUpperCase())
    .order('class', { ascending: true })
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

export async function getSchoolsForAdmin() {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
