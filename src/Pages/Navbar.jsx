import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import { auth } from '../Firebase'
import './Style.css'

function Navbar() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="nav-container">
      <NavLink to="/" className="nav-logo">Vybrr</NavLink>

      <ul className="nav-list">
        <li><NavLink to="/" end className="nav-link">Home</NavLink></li>
        <li><NavLink to="/explore" className="nav-link">Explore</NavLink></li>
        <li><NavLink to="/post-detail" className="nav-link">Post Detail</NavLink></li>

        {/* Only show these if logged in */}
        {user && <>
          <li><NavLink to="/dashboard" className="nav-link">Dashboard</NavLink></li>
          <li><NavLink to="/submit" className="nav-link">Submit</NavLink></li>
        </>}
      </ul>

      {user
        ? <button onClick={handleLogout} className="nav-login">Logout</button>
        : <NavLink to="/auth" className="nav-login">Login</NavLink>
      }
    </div>
  )
}

export default Navbar