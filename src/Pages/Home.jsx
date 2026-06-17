import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'
import PostCard from '../components/PostCard'
import SearchBar from '../components/SearchBar' // <-- IMPORT THE NEW SEARCHBAR HERE
import './Style.css'

function Home() {
  const [posts, setPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10))
        const querySnapshot = await getDocs(q)
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPosts(fetchedPosts)
      } catch (error) {
        console.error("Error fetching posts: ", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="home">
      
      {/* HERO SECTION */}
      <div className="home-hero">
        <div className="home-badge">
          <span className="home-badge-dot" />
          Now live — share your ideas
        </div>

        <h1 className="home-title">
          The place to share<br />
          <span className="home-title-accent">what you know</span>
        </h1>

        <p className="home-sub">
          Vybrr is a community for posting ideas, discovering
          trending content, and connecting with contributors
          who think like you.
        </p>

        <div className="home-actions">
          <Link to="/submit" className="btn-primary">Create a Post →</Link>
          <a href="#feed-section" className="btn-ghost">Browse posts</a>
        </div>

        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">{posts.length}+</span>
            <span className="home-stat-label">Live Posts</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">840</span>
            <span className="home-stat-label">Contributors</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">12k</span>
            <span className="home-stat-label">Monthly readers</span>
          </div>
        </div>
      </div>

      <hr className="home-divider" />

      {/* FEED SECTION */}
      <div id="feed-section" className="home-feed-container">

        <div className="feed-header">
          <h2>Community Feed</h2>
          
          {/* REUSABLE COMPONENT INSTANCE */}
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="🔍 Search posts by title or category..."
          />
        </div>

        {loading ? (
          <div className="feed-message">Loading fresh posts from Vybrr...</div>
        ) : filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="feed-message no-results">
            No posts match "{searchQuery}". Try searching another keyword!
          </div>
        )}

      </div>
    </div>
  )
}

export default Home