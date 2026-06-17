import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore'
import { db, auth } from '../Firebase'
import './Style.css'

function PostDetail() {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatedComment, setUpdatedComment] = useState('')
  const hasLiked = post?.likedBy?.includes(auth.currentUser?.uid)

  useEffect(() => {
    if (!id) { setLoading(false); return }

    const fetchPostData = async () => {
      try {
        const postRef = doc(db, 'posts', id)
        const postSnap = await getDoc(postRef)
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() })
        }
      } catch (error) {
        console.error("Error fetching post details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPostData()
  }, [id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!id || !updatedComment.trim() || !auth.currentUser) return

    try {
      const postRef = doc(db, 'posts', id)
      const newComment = {
        userId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        text: updatedComment,
        createdAt: new Date()
      }
      await updateDoc(postRef, { comments: arrayUnion(newComment) })
      setPost(prev => ({
        ...prev,
        comments: Array.isArray(prev.comments) ? [...prev.comments, newComment] : [newComment]
      }))
      setUpdatedComment('')
    } catch (error) {
      console.error("Error adding comment: ", error)
    }
  }

  const handleLikeToggle = async () => {
    if (!auth.currentUser || !id) return
    try {
      const postRef = doc(db, 'posts', id)
      if (hasLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(auth.currentUser.uid),
          likes: increment(-1)
        })
        setPost(prev => ({
          ...prev,
          likes: (prev.likes || 1) - 1,
          likedBy: prev.likedBy ? prev.likedBy.filter(uid => uid !== auth.currentUser.uid) : []
        }))
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(auth.currentUser.uid),
          likes: increment(1)
        })
        setPost(prev => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
          likedBy: prev.likedBy ? [...prev.likedBy, auth.currentUser.uid] : [auth.currentUser.uid]
        }))
      }
    } catch (error) {
      console.error("Error toggling like: ", error)
    }
  }

  if (loading) {
    return <div className="page-wrap"><div className="feed-skeleton">Loading post…</div></div>
  }

  if (!post) {
    return (
      <div className="page-wrap detail-missing">
        <h2>Post not found</h2>
        <p>This post may have been removed.</p>
        <Link to="/" className="btn-primary">← Back to feed</Link>
      </div>
    )
  }

  const comments = Array.isArray(post.comments) ? post.comments : []
  const dateFormatted = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now'
  const authorName = post.authorName || 'Anonymous'
  const initial = authorName.charAt(0).toUpperCase()

  return (
    <div className="page-wrap detail-wrap">
      <Link to="/" className="back-link">← Back to feed</Link>

      <article className="post-card detail-card">
        {/* Header */}
        <div className="post-head">
          <span className="avatar">{initial}</span>
          <div className="post-head-meta">
            <span className="post-author">{authorName}</span>
            <span className="post-sub">{dateFormatted} · <span className="post-cat-inline">{post.category || 'General'}</span></span>
          </div>
        </div>

        {/* Title + body */}
        <h1 className="detail-title">{post.title}</h1>
        <p className="detail-text">{post.description}</p>

        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="detail-tags">
            {post.tags.map(t => <span key={t} className="detail-tag">#{t}</span>)}
          </div>
        )}

        {/* Image */}
        {post.imageURL && (
          <div className="post-image-wrap detail-image">
            <img src={post.imageURL} alt={post.title} className="post-image" />
          </div>
        )}

        {/* Counts */}
        <div className="post-counts">
          <span>👍 {post.likes || 0}</span>
          <span>{comments.length} comments</span>
        </div>

        {/* Actions */}
        <div className="post-actions">
          <button onClick={handleLikeToggle} className={`post-action ${hasLiked ? 'post-action-liked' : ''}`}>
            {hasLiked ? '❤️' : '👍'} Like
          </button>
          <a href="#comment-box" className="post-action">💬 Comment</a>
          <button className="post-action">↗ Share</button>
        </div>
      </article>

      {/* Comments */}
      <div className="post-card comments-card">
        <h3 className="comments-heading">Comments <span>{comments.length}</span></h3>

        <form id="comment-box" onSubmit={handleAddComment} className="comment-form">
          <span className="avatar avatar-sm">
            {(auth.currentUser?.displayName || auth.currentUser?.email || 'U').charAt(0).toUpperCase()}
          </span>
          <input
            type="text"
            placeholder="Write a comment…"
            value={updatedComment}
            onChange={(e) => setUpdatedComment(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>

        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="comment-item">
                <span className="avatar avatar-sm">{(comment.authorName || 'U').charAt(0).toUpperCase()}</span>
                <div className="comment-bubble">
                  <div className="comment-author">{comment.authorName}</div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-time">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="feed-empty-card">No comments yet. Be the first to share your thoughts!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
