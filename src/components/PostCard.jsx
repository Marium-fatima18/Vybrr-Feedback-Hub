import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../Firebase'
import { avatarStyle } from '../utils/avatarColor'

function PostCard({ post, onDelete }) {
  const [showComments, setShowComments] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState(Array.isArray(post.comments) ? post.comments : [])
  const [submitting, setSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = auth.currentUser?.uid === post.authorId

  const dateFormatted = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now'

  const totalLikes = post.likes || 0
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy : []
  const authorName = post.authorName || 'Anonymous'
  const initial = authorName.charAt(0).toUpperCase()

  const handleToggleLikes = () => { setShowLikes(p => !p); setShowComments(false) }

  const getLikerName = (item) => typeof item === 'string' ? 'User' : (item?.name || 'User')
  const getLikerKey  = (item) => typeof item === 'string' ? item  : (item?.uid  || JSON.stringify(item))

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !auth.currentUser || submitting) return
    setSubmitting(true)
    const newComment = {
      userId:     auth.currentUser.uid,
      authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
      text:       commentText.trim(),
      createdAt:  new Date(),
    }
    try {
      await updateDoc(doc(db, 'posts', post.id), { comments: arrayUnion(newComment) })
      setLocalComments(prev => [...prev, newComment])
      setCommentText('')
    } catch (err) { console.error('Error adding comment:', err) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'posts', post.id))
      onDelete?.(post.id)
    } catch (err) {
      console.error('Error deleting post:', err)
      setDeleting(false)
    }
  }

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-head">
        <span className="avatar" style={avatarStyle(authorName)}>{initial}</span>
        <div className="post-head-meta">
          <span className="post-author">{authorName}</span>
          <span className="post-sub">
            {dateFormatted} · <span className="post-cat-inline">{post.category || 'General'}</span>
          </span>
        </div>

        {/* Owner menu */}
        {isOwner && (
          <div className="post-menu-wrap">
            <button
              className="post-menu-btn"
              onClick={() => setShowMenu(m => !m)}
              title="Post options"
            >⋯</button>
            {showMenu && (
              <>
                <div className="post-menu-backdrop" onClick={() => setShowMenu(false)} />
                <div className="post-menu-dropdown">
                  <button
                    className="post-menu-item post-menu-item--danger"
                    onClick={() => { setShowMenu(false); handleDelete() }}
                    disabled={deleting}
                  >
                    🗑️ {deleting ? 'Deleting…' : 'Delete post'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <Link to={`/post/${post.id}`} className="post-body-link">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">
          {post.description && post.description.length > 220
            ? `${post.description.substring(0, 220)}…`
            : post.description || 'No description available.'}
        </p>
      </Link>

      {/* Image */}
      {post.imageURL && (
        <Link to={`/post/${post.id}`} className="post-image-wrap">
          <img src={post.imageURL} alt={post.title} className="post-image" />
        </Link>
      )}

      {/* Counts */}
      <div className="post-counts">
        <button className="post-count-btn" onClick={handleToggleLikes}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', color: 'inherit' }}>
          👍 {totalLikes} {totalLikes === 1 ? 'like' : 'likes'}
        </button>
        <button className="post-count-btn" onClick={() => { setShowComments(p => !p); setShowLikes(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', color: 'inherit' }}>
          {localComments.length} comments
        </button>
      </div>

      {/* Action bar */}
      <div className="post-actions">
        <Link to={`/post/${post.id}`} className="post-action">👍 Like</Link>
        <button className="post-action" onClick={() => { setShowComments(p => !p); setShowLikes(false) }}>
          💬 {showComments ? 'Hide comments' : 'Comment'}
        </button>
      </div>

      {/* Likes panel */}
      {showLikes && (
        <div className="comment-list" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--divider)', paddingTop: '0.75rem' }}>
          {likedBy.length > 0 ? (
            likedBy.map(item => {
              const name = getLikerName(item)
              return (
                <div key={getLikerKey(item)} className="comment-item">
                  <span className="avatar avatar-sm" style={avatarStyle(name)}>{name.charAt(0).toUpperCase()}</span>
                  <div className="comment-bubble">
                    <div className="comment-author" style={{ fontSize: '0.85rem' }}>{name}</div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="feed-empty-card">No likes yet. Be the first!</div>
          )}
        </div>
      )}

      {/* Comments panel */}
      {showComments && (
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--divider)', paddingTop: '0.75rem' }}>
          <form onSubmit={handleAddComment} className="comment-form" style={{ marginBottom: '0.75rem' }}>
            <span className="avatar avatar-sm" style={avatarStyle(auth.currentUser?.displayName || auth.currentUser?.email || 'U')}>
              {(auth.currentUser?.displayName || auth.currentUser?.email || 'U').charAt(0).toUpperCase()}
            </span>
            <input
              type="text"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={submitting || !commentText.trim()}>
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </form>

          <div className="comment-list">
            {localComments.length > 0 ? (
              localComments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <span className="avatar avatar-sm" style={avatarStyle(comment.authorName || 'U')}>
                    {(comment.authorName || 'U').charAt(0).toUpperCase()}
                  </span>
                  <div className="comment-bubble">
                    <div className="comment-author">{comment.authorName}</div>
                    <div className="comment-text">{comment.text}</div>
                    <div className="comment-time">
                      {comment.createdAt?.toDate
                        ? comment.createdAt.toDate().toLocaleDateString()
                        : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feed-empty-card">No comments yet. Be the first!</div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default PostCard
