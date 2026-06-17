import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore'
import { db, auth } from '../Firebase'
import './Style.css'

function PostDetail() {
  // 💡 Router ke variable ka naam check karein. Agar App.jsx mein :id hai toh yahan 'id' hi aayega
  const { id } = useParams() 

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatedComment, setUpdatedComment] = useState('')
  const hasLiked = post?.likedBy?.includes(auth.currentUser?.uid)

  useEffect(() => {
    // Agar URL se ID mili hi nahi, toh Firebase ko call hi na karein
    if (!id) {
      console.error("URL mein koi ID nahi mili! Check your Router setup.");
      setLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        const postRef = doc(db, 'posts', id)
        const postSnap = await getDoc(postRef)

        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() })
        } else {
          console.log("No such post found in Firestore!")
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
    
    // 🔒 Extra Safety Guardrail: Agar ID undefined hai toh yahan se hi return ho jaye crash hone ke bajaye
    if (!id) {
      alert("Error: Cannot add comment because Post ID is missing.")
      return
    }
    if (!updatedComment.trim() || !auth.currentUser) return

    try {
      const postRef = doc(db, 'posts', id)

      const newComment = {
        userId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        text: updatedComment,
        createdAt: new Date() 
      }

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      })

      setPost(prev => ({
        ...prev,
        comments: prev.comments ? [...prev.comments, newComment] : [newComment]
      }))

      setUpdatedComment('')
    } catch (error) {
      console.error("Error adding comment: ", error)
    }
  }

  // ... baqi ka return statement bilkul wese hi rahega

  const handleLikeToggle = async () => {
  if (!auth.currentUser || !id) return // Safety check

  try {
    const postRef = doc(db, 'posts', id)

    if (hasLiked) {
      // 1. SCENARIO A: User ne pehle se like kiya hua hai -> UNLIKE KAREIN
      await updateDoc(postRef, {
        likedBy: arrayRemove(auth.currentUser.uid), // Array se UID nikal dein
        likes: increment(-1)                        // Total likes count 1 kam karein
      })

      // Live UI Update: Bina page refresh kiye screen par data badlein
      setPost(prev => ({
        ...prev,
        likes: (prev.likes || 1) - 1,
        likedBy: prev.likedBy ? prev.likedBy.filter(uid => uid !== auth.currentUser.uid) : []
      }))

    } else {
      // 2. SCENARIO B: User ne like nahi kiya hua -> LIKE KAREIN
      await updateDoc(postRef, {
        likedBy: arrayUnion(auth.currentUser.uid), // Array mein UID add karein
        likes: increment(1)                         // Total likes count 1 barhaein
      })

      // Live UI Update
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

  return (
    <div className="post-detail-container">
      {/* Post main layout content goes here... */}
      
      <hr />
      {/* LIKES SECTION CONTAINER */}
<div className="likes-section" style={{ margin: '20px 0' }}>
  <button 
    onClick={handleLikeToggle} 
    className={`btn-like ${hasLiked ? 'liked' : ''}`}
    style={{ fontSize: '18px', cursor: 'pointer', background: 'none', border: 'none' }}
  >
    {hasLiked ? '❤️' : '🤍'} Like ({post?.likes || 0})
  </button>
</div>

      {/* COMMENT SUBMISSION FORM */}
      <div className="comment-form-section">
        <h3>Add a Comment</h3>
        
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea 
            placeholder="Write your thoughts here..."
            className="comment-textarea"
            rows="3"
            value={updatedComment}
            onChange={(e) => setUpdatedComment(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Post Comment
          </button>
        </form>
      </div>


      {/* DISPLAYING EXISTING COMMENTS */}
      <div className="comments-display-section">
        <h3>Community Discussion</h3>
        
        <div className="comments-list">
          {/* TODO 4 FIXED: Corrected mapping flow & conditional safety guards */}
          {post?.comments && post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <div key={index} className="comment-bubble">
                <div className="comment-meta">
                  <strong>{comment.authorName}</strong> •{' '}
                  <span className="comment-date">
                    {comment.createdAt?.toDate 
                      ? comment.createdAt.toDate().toLocaleDateString() 
                      : 'Just now'}
                  </span>
                </div>
                <p className="comment-text-content">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="feed-message no-results">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default PostDetail