import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Chapter from './pages/Chapter'
import Practice from './pages/Practice'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import UploadChapter from './pages/admin/UploadChapter'
import { StudentSession } from './types'

function getSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem('student_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const session = getSession()
  if (!session) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireStudent>
              <Dashboard />
            </RequireStudent>
          }
        />
        <Route
          path="/chapter/:dayNum"
          element={
            <RequireStudent>
              <Chapter />
            </RequireStudent>
          }
        />
        <Route
          path="/practice/:id"
          element={
            <RequireStudent>
              <Practice />
            </RequireStudent>
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/upload" element={<UploadChapter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
