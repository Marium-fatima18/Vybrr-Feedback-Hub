import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { query, collection, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../Firebase'
import PostCard from '../components/PostCard'
import './Style.css'

function Dashboard() {
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardAssets = async () => {
      if (!auth.currentUser) return
      try {
        const q = query(collection(db, 'posts'), where('authorId', '==', auth.currentUser.uid))
        const querySnapshot = await getDocs(q)
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setMyPosts(fetchedPosts)
      } catch (error) {
        console.error("Error fetching dashboard: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardAssets()
  }, [])

  // Derived from state (so it recomputes after posts load) — fixes the stale-closure bug
  const totalPosts = myPosts.length
  const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
  const totalComments = myPosts.reduce(
    (sum, post) => sum + (Array.isArray(post.comments) ? post.comments.length : 0),
    0
  )

  const myRecentComments = []
  myPosts.forEach(post => {
    if (Array.isArray(post.comments)) {
      post.comments.forEach((comment, i) => {
        if (comment.userId === auth.currentUser?.uid) {
          myRecentComments.push({
            id: `${post.id}-${i}`,
            postTitle: post.title,
            text: comment.text,
            createdAt: comment.createdAt
          })
        }
      })
    }
  })

  const user = auth.currentUser
  const name = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Contributor')
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="page-wrap dashboard-wrap">

      {/* Profile header */}
      <div className="dash-header">
        <span className="avatar avatar-lg">{initial}</span>
        <div>
          <h1>{name}</h1>
          <p>{user?.email}</p>
        </div>
        <Link to="/submit" className="btn-primary dash-cta">➕ Create post</Link>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat"><span className="dash-stat-num">{totalPosts}</span><span className="dash-stat-label">Posts</span></div>
        <div className="dash-stat"><span className="dash-stat-num">{totalLikes}</span><span className="dash-stat-label">Likes received</span></div>
        <div className="dash-stat"><span className="dash-stat-num">{totalComments}</span><span className="dash-stat-label">Comments</span></div>
      </div>

      {/* Two columns */}
      <div className="dash-grid">
        <div className="dash-main">
          <h3 className="dash-section-title">My published content</h3>
          {loading ? (
            <div className="feed-skeleton">Loading your posts…</div>
          ) : myPosts.length > 0 ? (
            myPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="feed-empty-card">
              No posts yet. <Link to="/submit">Create your first post →</Link>
            </div>
          )}
        </div>

        <aside className="dash-side">
          <div className="side-card">
            <h4 className="side-card-title">Recent interactions</h4>
            {loading ? (
              <p className="side-muted">Loading activity…</p>
            ) : myRecentComments.length > 0 ? (
              myRecentComments.map(comment => (
                <div key={comment.id} className="dash-activity">
                  <p>You commented on <strong>“{comment.postTitle}”</strong></p>
                  <span className="dash-activity-quote">“{comment.text}”</span>
                  <span className="dash-activity-time">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Recent'}
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
