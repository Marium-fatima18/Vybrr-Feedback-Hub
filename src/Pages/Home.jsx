import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs, getCountFromServer} from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../Firebase'
import PostCard from '../components/PostCard'
import StoriesBar from '../components/StoriesBar'
import { avatarStyle } from '../utils/avatarColor'
import './Style.css'

function Home() {
const [user] = useAuthState(auth)
const [posts, setPosts] = useState([])
const [totalContributors, setTotalContributors] = useState(0)
const [searchQuery, setSearchQuery] = useState('')
const [loading, setLoading] = useState(true)
const navigate = useNavigate()

const initial = (user?.displayName || user?.email || 'V').charAt(0).toUpperCase()
const firstName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'there')

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30))
      const querySnapshot = await getDocs(q)
      const fetchedPosts = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => !post.groupId)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts: ", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContributorCount = async () => {
    try {
      const snapshot = await getCountFromServer(collection(db, 'usersTable2'))
      setTotalContributors(snapshot.data().count)
    } catch (error) {
      console.error("Error fetching contributor count:", error)
    }
  }

  fetchPosts()
  fetchContributorCount()
}, [user?.uid])

const filteredPosts = posts.filter(post =>
  (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
  (post.category || '').toLowerCase().includes(searchQuery.toLowerCase())
)

return (
  <div className="feed-layout">

    {/* LEFT SIDEBAR */}
    <aside className="side-left">
      <Link to="/dashboard" className="side-item">
        <span className="avatar avatar-sm" style={avatarStyle(user?.displayName || user?.email || 'V')}>{initial}</span>
        <span>{firstName}</span>
      </Link>
      <Link to="/" className="side-item"><span className="side-emoji">🏠</span> Home</Link>
      <Link to="/explore" className="side-item"><span className="side-emoji">🧭</span> Explore</Link>
      <Link to="/dashboard" className="side-item"><span className="side-emoji">📊</span> Dashboard</Link>
      <Link to="/groups" className="side-item"><span className="side-emoji">👥</span> Groups</Link>
      <div className="side-footer">Vybrr · Final Project © 2026</div>
    </aside>

    {/* CENTER FEED */}
    <main className="feed-center">

      {/* Stories */}
      <StoriesBar />

      {/* Inline search */}
      <div className="feed-search">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search posts by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && <button onClick={() => setSearchQuery('')}>✕</button>}
      </div>

      {/* Composer */}
      <div className="composer">
        <div className="composer-top">
          <span className="avatar" style={avatarStyle(user?.displayName || user?.email || 'V')}>{initial}</span>
          <button className="composer-input" onClick={() => navigate('/submit')}>
            What's on your mind, {firstName}?
          </button>
        </div>
        <div className="composer-divider" />
        <div className="composer-actions">
          <button className="composer-action" onClick={() => navigate('/submit')}>
            ✏️ <span>Write post</span>
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="feed-skeleton">Loading fresh posts from Vybrr…</div>
      ) : filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <PostCard key={post.id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
        ))
      ) : (
        <div className="feed-empty-card">
          {searchQuery
            ? <>No posts match “{searchQuery}”. Try another keyword.</>
            : <>No posts yet. <Link to="/submit">Be the first to post →</Link></>}
        </div>
      )}
    </main>

    {/* RIGHT SIDEBAR */}
    <aside className="side-right">
      <div className="side-card">
        <h4 className="side-card-title">Your stats</h4>
        <div className="side-stat"><span>Live posts</span><strong>{posts.length}</strong></div>
        <div className="side-stat"><span>Contributors</span><strong>{totalContributors}</strong></div>
      </div>

      <div className="side-card">
        <h4 className="side-card-title">Trending categories</h4>
        <div className="side-chips">
          {['Tech', 'Design', 'Dev', 'Career', 'Tutorial', 'News'].map(c => (
            <Link key={c} to="/explore" className="side-chip">#{c}</Link>
          ))}
        </div>
      </div>


    </aside>
  </div>
)
}

export default Home
