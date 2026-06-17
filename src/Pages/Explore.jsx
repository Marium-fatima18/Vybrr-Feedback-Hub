import React, { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../Firebase'
import PostCard from '../components/PostCard'
import './Style.css'

function Explore() {
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // ==========================================
  // TODO 1: SEARCH & CATEGORY STATES
  // ==========================================
  /* 👉 Hint: Hamein do states chahiye: 
     1. Search bar ke text ko track karne ke liye (Initial value: '')
     2. Selected category tab ko track karne ke liye (Initial value: 'All')
  */
  // ✍️ Apni dono states yahan likhein:




  const categories = ['All', 'Tech', 'Lifestyle', 'Education', 'Entertainment']

  // FETCHING DATA FROM FIREBASE
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAllPosts(fetched)
      } catch (error) {
        console.error("Error fetching explore posts: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllPosts()
  }, [])


  // ==========================================
  // TODO 2: THE JAVASCRIPT FILTER LOGIC
  // ==========================================
  /* 👉 Hint: Hamein allPosts array par `.filter()` chalana hai taake hum dynamic searching kar sakein.
     - Pehli condition: Kya post.category select ki hui category se match karti hai? (Yaa fir category === 'All' hai?)
     - Doosri condition: Kya post.title ya post.description user ke search query text ko match karta hai? (.toLowerCase() aur .includes() use karein)
  */
  const filteredPosts = allPosts // ✍️ Isko change kar ke pure JavaScript filter lagaein!


  return (
    <div className="explore-container">
      
      {/* HEADER & SEARCH BAR */}
      <div className="explore-header">
        <h1>Explore Community Content</h1>
        <p>Discover interesting stories, insights, and discussions.</p>
        
        <div className="search-box-wrapper">
          {/* ==========================================
              TODO 3: CONNECT THE SEARCH INPUT
             ========================================== */}
          <input 
            type="text"
            placeholder="Search by title or keyword..."
            className="search-input"
            /* ✍️ Is input box ko apni search state se connect karein using 'value' and 'onChange' */

          />
        </div>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="category-tabs-row">
        {categories.map((cat, index) => {
          // ==========================================
          // TODO 4: CHECK IF TAB IS ACTIVE
          // ==========================================
          /* 👉 Hint: Check karein agar 'cat' aur aapki selectedCategory state barabar hain, 
             toh activeTab boolean ko true kar dein taake CSS apply ho sakay.
          */
          const isActive = false // ✍️ Isko logic se replace karein (e.g., cat === yourState)

          return (
            <button
              key={index}
              /* ✍️ onClick par apni category state ko update karwane ka handler lagayein */
              onClick={() => {}} 
              className={`category-tab-btn ${isActive ? 'active-tab' : ''}`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* POSTS GRID DISPLAY */}
      <div className="explore-main-feed">
        {loading ? (
          <div className="feed-message">Loading fresh feed...</div>
        ) : filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="feed-message no-results">
            No posts match your search or category filter.
          </div>
        )}
      </div>

    </div>
  )
}

export default Explore