import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../Firebase'
import PostCard from '../components/PostCard'
import { avatarStyle } from '../utils/avatarColor'
import './Style.css'

function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user] = useAuthState(auth)
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroup = async () => {
      const groupSnap = await getDoc(doc(db, 'groups', id))
      if (groupSnap.exists()) setGroup({ id: groupSnap.id, ...groupSnap.data() })
    }

    const fetchPosts = async () => {
      const postsSnap = await getDocs(
        query(collection(db, 'posts'), where('groupId', '==', id))
      )
      const sorted = postsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
          const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
          return tb - ta
        })
      setPosts(sorted)
    }

    Promise.allSettled([fetchGroup(), fetchPosts()]).finally(() => setLoading(false))
  }, [id])

  const isMember = (group?.members || []).includes(user?.uid)

  const handleJoin = async () => {
    try {
      await updateDoc(doc(db, 'groups', id), { members: arrayUnion(user.uid) })
      setGroup(prev => ({ ...prev, members: [...(prev.members || []), user.uid] }))
    } catch (err) { console.error('Error joining:', err) }
  }

  const handleLeave = async () => {
    try {
      await updateDoc(doc(db, 'groups', id), { members: arrayRemove(user.uid) })
      setGroup(prev => ({ ...prev, members: (prev.members || []).filter(m => m !== user.uid) }))
    } catch (err) { console.error('Error leaving:', err) }
  }

  if (loading) return <div className="page-wrap"><div className="feed-skeleton">Loading group…</div></div>

  if (!group) return (
    <div className="page-wrap detail-missing">
      <h2>Group not found</h2>
      <p>This group may have been removed.</p>
      <Link to="/groups" className="btn-primary">← Back to Groups</Link>
    </div>
  )

  return (
    <div className="page-wrap group-detail-wrap">
      <Link to="/groups" className="back-link">← All Groups</Link>

      <div className="group-detail-header">
        <div className="group-detail-avatar" style={avatarStyle(group.name)}>{group.name[0].toUpperCase()}</div>
        <div className="group-detail-info">
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
          <span className="group-card-meta">
            {(group.members || []).length} members · Created by {group.creatorName}
          </span>
        </div>
        <div className="group-detail-actions">
          {isMember ? (
            <>
              <button className="btn-primary" onClick={() => navigate(`/submit?groupId=${id}`)}>
                ✏️ Post in group
              </button>
              <button className="group-btn group-btn-leave" onClick={handleLeave}>Leave</button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleJoin}>Join Group</button>
          )}
        </div>
      </div>

      <div className="group-feed">
        {!isMember ? (
          <div className="group-locked-wall">
            <div className="group-locked-icon">🔒</div>
            <h3>This group is private</h3>
            <p>Join the group to see posts from members.</p>
            <button className="btn-primary" onClick={handleJoin}>Join Group</button>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
          ))
        ) : (
          <div className="feed-empty-card">
            No posts yet. <Link to={`/submit?groupId=${id}`}>Be the first →</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupDetail
