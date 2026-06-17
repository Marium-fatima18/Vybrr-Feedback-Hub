import React from 'react'
import { useState,useEffect } from 'react'
import { query, collection, where, getDocs} from 'firebase/firestore'
import { auth, db } from '../Firebase'
import PostCard from '../components/PostCard'
import './Style.css'

function Dashboard() {
  /* 
    TODO 1: Create a state variable for your posts array.
    👉 Why? React needs to monitor this array so it can re-render the UI when your data loads.
    ✍️ Syntax Hint: const [myPosts, setMyPosts] = useState([])
  */

    const [myPosts, setMyPosts] = useState([])

  /* 
    TODO 2: Create a loading state (boolean).
    👉 Why? True when fetching from Firebase, False when done. Helps show a "Loading..." message.
  */

    const [loading, setLoading] = useState(true);

  /* 
    TODO 3: Create state hooks for your stats (total posts, total likes, etc.).
  */

    // const [totalPosts, setTotalPosts] = useState(0);
    // const [totalLikes, setTotalLikes] = useState(0);
    // const [totalComments, setTotalComments] = useState(0);
    const [myAllActivity, setMyAllActivity] = useState([]);

    const myRecentComments = []


  // ==========================================
  // YOUR FIREBASE EFFECTS ZONE
  // ==========================================
  
  /* 
    TODO 4: Create a useEffect block that runs ON MOUNT.
    👉 Inside this hook, write an async function to get data from Firestore.
    🔒 Critical Guardrail: Filter the query so it only pulls documents where 'authorId' matches the logged-in user's UID!
    
    Code snippet direction to explore:
    const q = query(collection(db, 'posts'), where('authorId', '==', auth.currentUser?.uid))
  */

    useEffect(()=> {
      const fetchDashboardAssets = async ()=> {
      if (!auth.currentUser) return;

        try{
          const q = query(collection(db, 'posts'), where('authorId', '==', auth.currentUser?.uid))
          const querySnapshot = await getDocs(q)
          const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
        setMyPosts(fetchedPosts);
        }
        catch (error) {
        console.error("Error fetching fetchDashboardAssets: ", error)
      } finally {
        setLoading(false)
      }
      }
      
      fetchDashboardAssets();

      myPosts.forEach(post => {
  // Agar is post mein comments ka array mojood hai
  if (post.comments && Array.isArray(post.comments)) {
    post.comments.forEach(comment => {
      // Check karein ke kya yeh comment isi login user ne kiya hai?
      if (comment.userId === auth.currentUser?.uid) {
        // Comment ka data aur jis post par kiya uski detail aik jagah jama karein
        myRecentComments.push({
          id: post.id + Math.random(), // Unique temporary key ke liye
          postTitle: post.title,
          text: comment.text,
          createdAt: comment.createdAt
        })
      }
    })
  }
})
    }, [])

  const totalPosts = myPosts.length
  const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
// Har post ke andar jo comments ka array hai, uski length ko jama (sum) karte jao
const totalComments = myPosts.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0)

  return (
    <div className="dashboard-container">
      
      {/* HEADER SECTION */}
      <div className="dashboard-header">
        {/* TODO 5: Replace static text below with real auth display name dynamically */}
        
        <h1>Welcome back, {auth.currentUser?.email || "Contributor"}!</h1>
        <p>Here is an overview of your community contributions.</p>
      </div>

      {/* 1. STATS BANNER ZONE */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Posts</span>
          {/* TODO 6: Output your posts state array length here dynamically */}
          <h2 className="stat-number">{totalPosts}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-label">Likes Received</span>
          {/* TODO 7: Loop through your posts array and sum up all the 'likes' values */}
          <h2 className="stat-number">{totalLikes}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-label">Comments Generated</span>
          <h2 className="stat-number">{totalComments}</h2>
        </div>
      </div>

      {/* TWO COLUMN GRID CONTENT */}
      <div className="dashboard-content-layout">
        
        {/* LEFT COLUMN: PRIMARY MANAGED POSTS FEED */}
        <div className="dashboard-main-feed">
          <h3>My Published Content</h3>
          
          <div className="dashboard-posts-list">
            {/* 
              TODO 8: Write a conditional JavaScript statement here:
              - If loading is true: show a loading message div.
              - If loading is false and posts array is empty: show an empty-state message.
              - If posts array has items: use .map() to loop through them and render individual post templates.
            */}

             {loading ? (
          <div className="feed-message">Loading your posts on Vybrr...</div>
        ) : myPosts.length > 0 ? (
          <div className="posts-grid">
            {myPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="feed-message no-results">
            No posts yet!
          </div>
        )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT CONTEXTUAL LOGS */}
        <div className="dashboard-sidebar-activity">
          
          <div className="dashboard-sidebar-activity">
  <h3>Recent Interactions</h3>
  
  <div className="activity-timeline-log">
    {loading ? (
      <p>Loading activity...</p>
    ) : myRecentComments.length > 0 ? (
      myRecentComments.map(comment => (
        <div key={comment.id} className="timeline-entry-card">
          <p className="entry-text">
            You commented on <strong>"{comment.postTitle}"</strong>:
          </p>
          <span className="entry-quote">"{comment.text}"</span>
          <span className="entry-time">
            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Recent'}
          </span>
        </div>
      ))
    ) : (
      <div className="feed-message no-results">
        No recent comments found on your posts!
      </div>
    )}
  </div>
</div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard