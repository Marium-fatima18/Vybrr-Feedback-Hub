import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import { Sun, Moon } from 'lucide-react'
import { auth } from '../Firebase'
import { avatarStyle } from '../utils/avatarColor'
import { useTheme } from '../utils/useTheme'
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

  const { theme, toggle } = useTheme()
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
        <NavLink to="/dashboard" className="topbar-tab" title="Dashboard">
          <span className="topbar-tab-icon">📊</span>
        </NavLink>
        <NavLink to="/groups" className="topbar-tab" title="Groups">
          <span className="topbar-tab-icon">👥</span>
        </NavLink>
      </nav>

      {/* Right: profile menu */}
      <div className="topbar-right">
        <button className="theme-toggle-btn" onClick={toggle} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {/* Main topbar circle triggers the menu open/close toggle */}
        <button className="topbar-profile" onClick={() => setMenuOpen(o => !o)}>
          <span className="avatar avatar-sm" style={avatarStyle(user?.displayName || user?.email || 'V')}>{initial}</span>
        </button>

        {menuOpen && (
          <>
            <div className="topbar-menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="topbar-menu">
              
              {/* 👑 UPDATED: Dropdown inner header is now a clickable NavLink leading to profile */}
              <NavLink 
                to="/profile" 
                className="topbar-menu-head-link" 
                onClick={() => setMenuOpen(false)}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div className="topbar-menu-head" style={{ cursor: 'pointer' }}>
                  <span className="avatar" style={avatarStyle(user?.displayName || user?.email || 'V')}>{initial}</span>
                  <div>
                    <div className="topbar-menu-name">{name}</div>
                    <div className="topbar-menu-email">{user?.email}</div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/dashboard" className="topbar-menu-item" onClick={() => setMenuOpen(false)}>
                📊 My dashboard
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