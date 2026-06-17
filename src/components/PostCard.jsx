import React from 'react'
import { Link } from 'react-router-dom'

function PostCard({ post }) {
  // Safe extraction of date
  const dateFormatted = post.createdAt?.toDate 
    ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now'

  // Safety fallbacks values if undefined
  const totalLikes = post.likes || 0
  const totalComments = post.comments ? post.comments.length : 0

  return (
    <div className="post-card">
      {post.imageURL && (
        <div className="card-image-wrapper">
          <img src={post.imageURL} alt={post.title} className="card-image" />
        </div>
      )}
      
      <div className="card-content">
        <div className="card-top-row">
          <span className="card-category-badge">{post.category}</span>
          
          {/* Quick inline status metrics indicator */}
          <div className="card-mini-metrics">
            <span>👍 {totalLikes}</span>
            <span>💬 {totalComments}</span>
          </div>
        </div>
        
        <h3 className="card-title">
          {/* 💡 LINK IS DYNAMICALLY ROUTING WITH DOCK ID */}
          <Link to={`/post/${post.id || post._id}`}>{post.title}</Link>
        </h3>
        
        <p className="card-description-excerpt">
          {post.description && post.description.length > 120 
            ? `${post.description.substring(0, 120)}...` 
            : post.description || 'No description available.'}
        </p>
        
        <div className="card-footer">
          <div className="card-author-info">
            <span className="card-author-name">By {post.authorName || 'Anonymous'}</span>
          </div>
          <span className="card-date">{dateFormatted}</span>
        </div>

        {/* View Post action click zone */}
        <div className="card-action-bar">
          <Link to={`/post/${post.id}`} className="card-read-more-link">
            Read Discussion →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCard