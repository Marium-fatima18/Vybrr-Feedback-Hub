import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../Firebase'
import PostCard from '../components/PostCard'
import './Style.css'

function Explore() {
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Tech', 'Design', 'Dev', 'Career', 'Tutorial', 'Opinion', 'News']

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAllPosts(fetched)
      } catch (error) {
        console.error("Error fetching explore posts: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllPosts()
  }, [])

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const term = search.toLowerCase()
    const matchesSearch =
      (post.title || '').toLowerCase().includes(term) ||
      (post.description || '').toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="page-wrap explore-wrap">
      <div className="explore-header">
        <h1>Explore Vybrr</h1>
        <p>Discover stories, insights, and discussions from the community.</p>

        <div className="feed-search explore-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by title or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-tab ${cat === selectedCategory ? 'category-tab-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="explore-feed">
        {loading ? (
          <div className="feed-skeleton">Loading fresh feed…</div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="feed-empty-card">No posts match your search or category filter.</div>
        )}
      </div>
    </div>
  )
}

export default Explore
