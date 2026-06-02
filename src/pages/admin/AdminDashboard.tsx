import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, getSchoolsForAdmin, getAllStudentsWithProgress, createSchool, createStudent, deleteStudent } from '../../lib/supabase'
import { School, Progress } from '../../types'
import { CHAPTERS } from '../../data/chapters'

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V']

interface StudentWithProgress {
  id: string
  name: string
  class: string
  joining_code: string
  school_code: string
  progress: Progress[]
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [students, setStudents] = useState<StudentWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [creatingSchool, setCreatingSchool] = useState(false)
  const [showCreateSchool, setShowCreateSchool] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentClass, setNewStudentClass] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)
  const [lastAddedCode, setLastAddedCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/admin')
        return
      }
      loadSchools()
    })
  }, [navigate])

  async function loadSchools() {
    try {
      const data = await getSchoolsForAdmin()
      setSchools(data)
      if (data.length > 0) {
        setSelectedSchool(data[0])
        await loadSchoolData(data[0].joining_code)
      }
    } catch (err) {
      setError('Failed to load schools.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSchoolData(joiningCode: string) {
    try {
      const studentsData = await getAllStudentsWithProgress(joiningCode)
      setStudents(studentsData)
    } catch (err) {
      setError('Failed to load school data.')
      console.error(err)
    }
  }

  async function handleSelectSchool(school: School) {
    setSelectedSchool(school)
    setLoading(true)
    await loadSchoolData(school.joining_code)
    setLoading(false)
  }

  async function handleCreateSchool() {
    if (!newSchoolName.trim()) return
    setCreatingSchool(true)
    setError('')
    try {
      const code = generateCode()
      const school = await createSchool(newSchoolName.trim(), code)
      setSchools(prev => [school, ...prev])
      setNewSchoolName('')
      setShowCreateSchool(false)
      alert(`School created!\nJoining code: ${school.joining_code}\nShare this with students.`)
    } catch (err) {
      setError('Failed to create school. Code may already exist, try again.')
      console.error(err)
    } finally {
      setCreatingSchool(false)
    }
  }

  async function handleDeleteStudent(studentId: string, studentName: string) {
    if (!confirm(`Delete "${studentName}"? This will remove all their progress too.`)) return
    try {
      await deleteStudent(studentId)
      setStudents(prev => prev.filter(s => s.id !== studentId))
    } catch (err) {
      setError('Failed to delete student.')
      console.error(err)
    }
  }

  async function handleAddStudent() {
    if (!newStudentName.trim() || !newStudentClass || !selectedSchool) return
    setAddingStudent(true)
    setError('')
    try {
      const student = await createStudent(newStudentName.trim(), newStudentClass, selectedSchool.joining_code)
      setLastAddedCode(student.joining_code)
      setNewStudentName('')
      setNewStudentClass('')
      await loadSchoolData(selectedSchool.joining_code)
    } catch (err) {
      setError('Failed to add student. Please try again.')
      console.error(err)
    } finally {
      setAddingStudent(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-lg">Teacher Dashboard</h1>
          <p className="text-gray-400 text-xs">Manage schools, students, chapters</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/upload"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-3 py-2 rounded-lg transition touch-target flex items-center"
          >
            + Upload Chapter
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white font-bold text-sm px-3 py-2 rounded-lg hover:bg-gray-700 transition touch-target"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Schools */}
        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-gray-800 text-base">Schools</h2>
            <button
              onClick={() => setShowCreateSchool(v => !v)}
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              + New School
            </button>
          </div>

          {showCreateSchool && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSchoolName}
                onChange={e => setNewSchoolName(e.target.value)}
                placeholder="School name"
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={handleCreateSchool}
                disabled={creatingSchool}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition disabled:opacity-60"
              >
                {creatingSchool ? '...' : 'Create'}
              </button>
            </div>
          )}

          {schools.length === 0 && !loading && (
            <p className="text-gray-400 text-sm">No schools yet. Create one above.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {schools.map(school => (
              <button
                key={school.id}
                onClick={() => handleSelectSchool(school)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  selectedSchool?.id === school.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {school.name}
                <span className="ml-1 opacity-70 font-mono text-xs">({school.joining_code})</span>
              </button>
            ))}
          </div>
        </section>

        {selectedSchool && (
          <>
            {/* Joining Code */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-500 font-bold">Joining Code for Students</p>
                <p className="text-2xl font-black text-indigo-700 tracking-widest">{selectedSchool.joining_code}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(selectedSchool.joining_code)
                  alert('Copied to clipboard!')
                }}
                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm touch-target"
              >
                Copy
              </button>
            </div>

            {/* Chapters */}
            <section className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-black text-gray-800 text-base mb-3">
                Chapters ({CHAPTERS.length} days built-in)
              </h2>
              <div className="space-y-2">
                  {CHAPTERS.map(ch => (
                    <div key={ch.day} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {ch.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{ch.title}</p>
                        <p className="text-xs text-gray-500">
                          Week {ch.week} · {ch.sentences.length} sentences · {ch.vocabulary.length} words
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
            </section>

            {/* Students */}
            <section className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-gray-800 text-base">Students ({students.length})</h2>
                <button
                  onClick={() => { setShowAddStudent(v => !v); setLastAddedCode('') }}
                  className="text-sm text-indigo-600 font-bold hover:underline"
                >
                  + Add Student
                </button>
              </div>

              {showAddStudent && (
                <div className="bg-indigo-50 rounded-xl p-3 mb-3 space-y-2">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="Student full name"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <select
                    value={newStudentClass}
                    onChange={e => setNewStudentClass(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={handleAddStudent}
                    disabled={addingStudent || !newStudentName.trim() || !newStudentClass}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition disabled:opacity-60"
                  >
                    {addingStudent ? 'Adding...' : 'Add & Generate Code'}
                  </button>
                  {lastAddedCode && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-600 font-bold mb-1">Student added! Share this code:</p>
                      <p className="text-2xl font-black text-green-700 tracking-widest">{lastAddedCode}</p>
                      <button
                        onClick={() => { navigator.clipboard?.writeText(lastAddedCode); alert('Copied!') }}
                        className="mt-1 text-xs text-green-600 underline"
                      >Copy code</button>
                    </div>
                  )}
                </div>
              )}

              {loading ? (
                <div className="py-4 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : students.length === 0 ? (
                <p className="text-gray-400 text-sm">No students added yet. Add students above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-bold">Name</th>
                        <th className="pb-2 font-bold">Class</th>
                        <th className="pb-2 font-bold">Code</th>
                        <th className="pb-2 font-bold text-right">Days ✓</th>
                        <th className="pb-2 font-bold text-right">Rev.</th>
                        <th className="pb-2 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const completedDays = student.progress.filter((p: Progress) => p.revision_count >= 10).length
                        const totalRevisions = student.progress.reduce((sum: number, p: Progress) => sum + p.revision_count, 0)
                        return (
                          <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 font-semibold text-gray-800">{student.name}</td>
                            <td className="py-2 text-gray-600 text-xs">{student.class}</td>
                            <td className="py-2">
                              <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-bold tracking-widest">
                                {student.joining_code}
                              </span>
                            </td>
                            <td className="py-2 text-right font-bold text-green-600">{completedDays}</td>
                            <td className="py-2 text-right font-bold text-indigo-600">{totalRevisions}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
