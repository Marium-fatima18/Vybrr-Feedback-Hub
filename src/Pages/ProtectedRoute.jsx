import { Navigate, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../Firebase'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const [user, loading] = useAuthState(auth)

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />

  return children
}

export default ProtectedRoute