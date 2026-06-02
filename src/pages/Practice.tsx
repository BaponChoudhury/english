import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Speaking practice is now built into the Speak tab of the Chapter page.
// Redirect back to the chapter so students use the integrated flow.
export default function Practice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  useEffect(() => { navigate(`/chapter/${id ?? '1'}`, { replace: true }) }, [])
  return null
}
