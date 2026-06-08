import { NavLink } from 'react-router-dom'
import './Style.css'

function Navbar() {
  return (
    <div className="nav-container">
      <span className="nav-logo">Vybrr</span>
      <ul className="nav-list">
        <li><NavLink to="/" end className="nav-link">Home</NavLink></li>
        <li><NavLink to="/explore" className="nav-link">Explore</NavLink></li>
        <li><NavLink to="/dashboard" className="nav-link">Dashboard</NavLink></li>
        <li><NavLink to="/submit" className="nav-link">Submit</NavLink></li>
      </ul>
      <NavLink to="/auth" className="nav-login">Login</NavLink>
    </div>
  )
}

export default Navbar