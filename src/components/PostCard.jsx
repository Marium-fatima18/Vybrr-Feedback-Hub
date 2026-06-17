import { Link } from 'react-router-dom'

function PostCard({ post }) {
  const dateFormatted = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now'

  const totalLikes = post.likes || 0
  // comments may be a number (legacy) or an array of comment objects
  const totalComments = Array.isArray(post.comments)
    ? post.comments.length
    : (post.comments || 0)

  const authorName = post.authorName || 'Anonymous'
  const initial = authorName.charAt(0).toUpperCase()

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-head">
        <span className="avatar">{initial}</span>
        <div className="post-head-meta">
          <span className="post-author">{authorName}</span>
          <span className="post-sub">
            {dateFormatted} · <span className="post-cat-inline">{post.category || 'General'}</span>
          </span>
        </div>
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
        <span>👍 {totalLikes}</span>
        <span>{totalComments} comments</span>
      </div>

      {/* Action bar */}
      <div className="post-actions">
        <Link to={`/post/${post.id}`} className="post-action">👍 Like</Link>
        <Link to={`/post/${post.id}`} className="post-action">💬 Comment</Link>
        <Link to={`/post/${post.id}`} className="post-action">↗ Share</Link>
      </div>
    </article>
  )
}

export default PostCard
