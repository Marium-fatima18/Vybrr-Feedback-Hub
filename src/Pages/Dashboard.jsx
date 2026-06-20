import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { query, collection, where, getDocs, orderBy } from 'firebase/firestore'
import { auth, db } from '../Firebase'
import PostCard from '../components/PostCard'
import StoriesBar from '../components/StoriesBar'
import { avatarStyle } from '../utils/avatarColor'
import './Style.css'

function Dashboard() {
  const [myPosts, setMyPosts] = useState([])
  const [myRecentComments, setMyRecentComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [interactionsLoading, setInteractionsLoading] = useState(true)

  useEffect(() => {
    if (!auth.currentUser) return

    const fetchMyPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), where('authorId', '==', auth.currentUser.uid))
        const snapshot = await getDocs(q)
        setMyPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error("Error fetching my posts:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchMyComments = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        )
        const interactions = []
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          if (!Array.isArray(data.comments)) return
          data.comments.forEach((comment, i) => {
            if (comment.userId === auth.currentUser?.uid) {
              interactions.push({
                id: `${doc.id}-${i}`,
                postId: doc.id,
                postTitle: data.title,
                text: comment.text,
                createdAt: comment.createdAt,
              })
            }
          })
        })
        interactions.sort((a, b) => {
          const t = (c) => c.createdAt?.toDate ? c.createdAt.toDate().getTime() : 0
          return t(b) - t(a)
        })
        setMyRecentComments(interactions.slice(0, 8))
      } catch (error) {
        console.error("Error fetching interactions:", error)
      } finally {
        setInteractionsLoading(false)
      }
    }

    fetchMyPosts()
    fetchMyComments()
  }, [])

  const totalPosts    = myPosts.length
  const totalLikes    = myPosts.reduce((sum, p) => sum + (p.likes || 0), 0)
  const totalComments = myPosts.reduce(
    (sum, p) => sum + (Array.isArray(p.comments) ? p.comments.length : 0), 0
  )

  const user    = auth.currentUser
  const name    = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Contributor')
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="page-wrap dashboard-wrap">

      {/* Profile header */}
      <div className="dash-header">
        <span className="avatar avatar-lg" style={avatarStyle(user?.displayName || user?.email || 'V')}>{initial}</span>
        <div>
          <h1>{name}</h1>
          <p>{user?.email}</p>
        </div>
        <Link to="/submit" className="btn-primary dash-cta">➕ Create post</Link>
      </div>

      {/* Stories */}
      <StoriesBar />

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat"><span className="dash-stat-num">{totalPosts}</span><span className="dash-stat-label">Posts</span></div>
        <div className="dash-stat"><span className="dash-stat-num">{totalLikes}</span><span className="dash-stat-label">Likes received</span></div>
        <div className="dash-stat"><span className="dash-stat-num">{totalComments}</span><span className="dash-stat-label">Comments on my posts</span></div>
      </div>

      {/* Two columns */}
      <div className="dash-grid">
        <div className="dash-main">
          <h3 className="dash-section-title">My published content</h3>
          {loading ? (
            <div className="feed-skeleton">Loading your posts…</div>
          ) : myPosts.length > 0 ? (
            myPosts.map(post => (
              <PostCard key={post.id} post={post} onDelete={id => setMyPosts(prev => prev.filter(p => p.id !== id))} />
            ))
          ) : (
            <div className="feed-empty-card">
              No posts yet. <Link to="/submit">Create your first post →</Link>
            </div>
          )}
        </div>

        <aside className="dash-side">
          <div className="side-card">
            <h4 className="side-card-title">Recent interactions</h4>
            {interactionsLoading ? (
              <p className="side-muted">Loading activity…</p>
            ) : myRecentComments.length > 0 ? (
              myRecentComments.map(comment => (
                <div key={comment.id} className="dash-activity">
                  <p>
                    You commented on{' '}
                    <Link to={`/post/${comment.postId}`} style={{ color: 'var(--fb-blue)', fontWeight: 600, textDecoration: 'none' }}>
                      "{comment.postTitle}"
                    </Link>
                  </p>
                  <span className="dash-activity-quote">"{comment.text}"</span>
                  <span className="dash-activity-time">
                    {comment.createdAt?.toDate
                      ? comment.createdAt.toDate().toLocaleDateString()
                      : 'Recent'}
                  </span>
                </div>
              ))
            ) : (
              <p className="side-muted">No recent comments yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
