import { Link } from 'react-router-dom'
import './Style.css'

function Home() {
  return (
    <div className="home">
      <div className="home-badge">
        <span className="home-badge-dot" />
        Now live — share your ideas
      </div>

      <h1 className="home-title">
        The place to share<br />
        <span className="home-title-accent">what you know</span>
      </h1>

      <p className="home-sub">
        Vybrr is a community for posting ideas, discovering
        trending content, and connecting with contributors
        who think like you.
      </p>

      <div className="home-actions">
        <Link to="/auth" className="btn-primary">Get started →</Link>
        <Link to="/explore" className="btn-ghost">Browse posts</Link>
      </div>

      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat-num">2.4k</span>
          <span className="home-stat-label">Posts</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">840</span>
          <span className="home-stat-label">Contributors</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">12k</span>
          <span className="home-stat-label">Monthly readers</span>
        </div>
      </div>
    </div>
  )
}

export default Home