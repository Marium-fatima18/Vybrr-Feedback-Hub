import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import { auth } from '../Firebase'
import './Style.css'

function Navbar() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    setMenuOpen(false)
    navigate('/auth')
  }

  const initial = (user?.displayName || user?.email || 'V').charAt(0).toUpperCase()
  const name = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You')

  return (
    <header className="topbar">
      {/* Left: logo + search */}
      <div className="topbar-left">
        <NavLink to="/" className="topbar-logo">V</NavLink>
        <div className="topbar-search">
          <span className="topbar-search-icon">🔍</span>
          <input type="text" placeholder="Search Vybrr" onFocus={() => navigate('/explore')} readOnly />
        </div>
      </div>

      {/* Center: primary nav */}
      <nav className="topbar-nav">
        <NavLink to="/" end className="topbar-tab" title="Home">
          <span className="topbar-tab-icon">🏠</span>
        </NavLink>
        <NavLink to="/explore" className="topbar-tab" title="Explore">
          <span className="topbar-tab-icon">🧭</span>
        </NavLink>
        <NavLink to="/submit" className="topbar-tab" title="Create post">
          <span className="topbar-tab-icon">➕</span>
        </NavLink>
        <NavLink to="/dashboard" className="topbar-tab" title="Dashboard">
          <span className="topbar-tab-icon">📊</span>
        </NavLink>
      </nav>

      {/* Right: profile menu */}
      <div className="topbar-right">
        <button className="topbar-profile" onClick={() => setMenuOpen(o => !o)}>
          <span className="avatar avatar-sm">{initial}</span>
        </button>

        {menuOpen && (
          <>
            <div className="topbar-menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="topbar-menu">
              <div className="topbar-menu-head">
                <span className="avatar">{initial}</span>
                <div>
                  <div className="topbar-menu-name">{name}</div>
                  <div className="topbar-menu-email">{user?.email}</div>
                </div>
              </div>
              <NavLink to="/dashboard" className="topbar-menu-item" onClick={() => setMenuOpen(false)}>
                📊 My dashboard
              </NavLink>
              <NavLink to="/submit" className="topbar-menu-item" onClick={() => setMenuOpen(false)}>
                ➕ Create a post
              </NavLink>
              <button className="topbar-menu-item topbar-logout" onClick={handleLogout}>
                🚪 Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
