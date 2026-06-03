import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getStudentByAuthId, linkStudentToAuth } from '../lib/supabase'
import AnimatedCharacter from '../components/AnimatedCharacter'

type Screen = 'signin' | 'signup' | 'link'

function saveSession(student: any) {
  localStorage.setItem('student_session', JSON.stringify({
    id: student.id,
    name: student.name,
    class: student.class,
    joining_code: student.joining_code,
    school_code: student.school_code,
  }))
}

export default function Login() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [joiningCode, setJoiningCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Defined with useCallback so the effect can safely depend on it
  const handleAuthSession = useCallback(async (authUserId: string) => {
    const student = await getStudentByAuthId(authUserId)
    if (student) {
      saveSession(student)
      navigate('/dashboard')
    } else {
      setLoading(false)
      setScreen('link')
    }
  }, [navigate])

  useEffect(() => {
    // OAuth redirect: Supabase appends #access_token after Google sign-in
    if (window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(async ({ data }) => {
        window.history.replaceState(null, '', window.location.pathname)
        if (data.session) {
          localStorage.removeItem('student_session')
          await handleAuthSession(data.session.user.id)
        }
      })
      return
    }

    // Already have a valid local session
    const raw = localStorage.getItem('student_session')
    if (raw) {
      try {
        const s = JSON.parse(raw)
        if (s.id && s.id !== 'admin-preview') { navigate('/dashboard'); return }
      } catch {}
    }

    // Already signed into Supabase (page refresh)
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await handleAuthSession(data.session.user.id)
    })
  }, [navigate, handleAuthSession])

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    const redirectTo = window.location.hostname === 'localhost'
      ? window.location.origin
      : 'https://englishbuddy.pveschool.in'
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Enter email and password.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) await handleAuthSession(data.session.user.id)
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Enter email and password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message || 'Sign up failed.'); setLoading(false); return }
    if (data.session) {
      await handleAuthSession(data.session.user.id)
    } else {
      // session is null when email confirmation is still ON in Supabase
      setError('Please disable "Confirm email" in Supabase Auth settings, then try again.')
      setLoading(false)
    }
  }

  async function handleLinkCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!joiningCode.trim()) { setError('Enter your joining code.'); return }
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')
      const student = await linkStudentToAuth(joiningCode.trim(), session.user.id)
      saveSession(student)
      navigate('/dashboard')
    } catch {
      setError('Invalid code or code already used. Ask your teacher.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex justify-center mb-2">
          <AnimatedCharacter size={120} />
        </div>
        <h1 className="text-2xl font-black text-center text-indigo-700 mb-1">English Buddy</h1>
        <p className="text-center text-gray-500 text-sm mb-5">Learn spoken English — one day at a time!</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">{error}</div>
        )}

        {/* ── Link joining code ── */}
        {screen === 'link' && (
          <form onSubmit={handleLinkCode} className="space-y-4">
            <div className="bg-indigo-50 rounded-2xl p-4 text-center space-y-1">
              <div className="text-3xl">🎉</div>
              <p className="text-indigo-700 font-black text-base">Account ready!</p>
              <p className="text-indigo-500 text-sm">Enter the <strong>joining code</strong> your teacher gave you. You only need to do this once.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1 text-center">Your Joining Code</label>
              <input
                type="text"
                value={joiningCode}
                onChange={e => setJoiningCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-3xl font-black tracking-widest uppercase text-center focus:outline-none focus:border-indigo-500"
                autoComplete="off"
                autoFocus
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1 text-center">Ask your teacher if you don't have it</p>
            </div>
            <button type="submit" disabled={loading || joiningCode.length < 4}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-xl py-4 transition shadow-lg disabled:opacity-60 touch-target">
              {loading ? 'Linking…' : '✅ Link & Start Learning!'}
            </button>
            <button type="button" onClick={() => supabase.auth.signOut().then(() => { setScreen('signin'); setError('') })}
              className="w-full text-gray-400 text-sm font-semibold py-2 hover:text-gray-600">
              ← Use a different account
            </button>
          </form>
        )}

        {/* ── Sign In ── */}
        {screen === 'signin' && (
          <>
            <button onClick={handleGoogleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-700 font-bold rounded-xl py-3.5 mb-4 transition shadow-sm disabled:opacity-60 touch-target">
              <GoogleIcon />
              Continue with Google
            </button>
            <Divider />
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 transition" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 transition" />
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl py-4 transition shadow-lg disabled:opacity-60 touch-target">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              New here?{' '}
              <button onClick={() => { setScreen('signup'); setError('') }} className="text-indigo-600 font-bold hover:underline">Create account</button>
            </p>
          </>
        )}

        {/* ── Sign Up ── */}
        {screen === 'signup' && (
          <>
            <button onClick={handleGoogleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-700 font-bold rounded-xl py-3.5 mb-4 transition shadow-sm disabled:opacity-60 touch-target">
              <GoogleIcon />
              Sign up with Google
            </button>
            <Divider />
            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 transition" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 transition" />
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl py-4 transition shadow-lg disabled:opacity-60 touch-target">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <button onClick={() => { setScreen('signin'); setError('') }} className="text-indigo-600 font-bold hover:underline">Sign in</button>
            </p>
          </>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <a href="/admin" className="text-xs text-gray-400 hover:text-indigo-600 transition">Teacher? Login here</a>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.7 0 6.8 5.4 2.9 13.3l7.9 6.1C12.5 13 17.9 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.5c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 36.6 46.1 31 46.1 24.5z"/>
      <path fill="#FBBC05" d="M10.8 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.3 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.3-6z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7-5.4c-2 1.4-4.6 2.2-8.2 2.2-6.1 0-11.3-4.1-13.2-9.7l-8.3 6C6.8 42.6 14.7 48 24 48z"/>
    </svg>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-semibold">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
