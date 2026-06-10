import './Post.css'

function PostDetail() {
  return (
    <div className="post-detail-page">
      <div className="post-detail-card">

        <div className="post-top">
          <span className="post-category">Design Feedback</span>
          <span className="post-time">2 hours ago</span>
        </div>

        <h1 className="post-title">
          How can I improve the UI of my portfolio website?
        </h1>

        <p className="post-description">
          I recently designed my portfolio website and wanted honest
          feedback about the layout, spacing, colors, and responsiveness.
          I tried to keep the design modern and minimal. Suggestions
          regarding animations and user experience are welcome.
        </p>

        <div className="post-tags">
          <span>#uiux</span>
          <span>#frontend</span>
          <span>#react</span>
          <span>#design</span>
        </div>

        <div className="post-user">
          <div className="post-avatar">M</div>

          <div>
            <h4>Marium Fatima</h4>
            <p>Frontend Developer</p>
          </div>
        </div>

        <div className="post-actions">
          <button>👍 Like</button>
          <button>💬 Comment</button>
          <button>🔗 Share</button>
        </div>

        <div className="comment-section">
          <h2>Comments</h2>

          <div className="comment-card">
            <h4>Ahmed Khan</h4>
            <p>
              The design looks clean. You can improve spacing between
              sections and make the buttons more prominent.
            </p>
          </div>

          <div className="comment-card">
            <h4>Sarah Ali</h4>
            <p>
              I really like the dark theme. Adding hover animations
              would make the website feel more interactive.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PostDetail