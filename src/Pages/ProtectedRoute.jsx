import { Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../Firebase'

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth)

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/auth" replace />

  return children
}

export default ProtectedRoute