import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../Firebase'
import { avatarStyle } from '../utils/avatarColor'

const NEON_GRADIENTS = [
  'linear-gradient(135deg, #f72585, #b5179e)',
  'linear-gradient(135deg, #7209b7, #4361ee)',
  'linear-gradient(135deg, #4cc9f0, #4361ee)',
  'linear-gradient(135deg, #06d6a0, #0096c7)',
  'linear-gradient(135deg, #ff6b35, #f72585)',
  'linear-gradient(135deg, #ffd60a, #e85d04)',
  'linear-gradient(135deg, #3a86ff, #8338ec)',
  'linear-gradient(135deg, #00f5d4, #00bbf9)',
]

const STORY_DURATION = 5000

function timeAgo(story) {
  const t = story.createdAt?.toDate?.()
  if (!t) return ''
  const diff = Date.now() - t.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'Just now'
}

function StoriesBar() {
  const [stories, setStories]           = useState([])
  const [viewing, setViewing]           = useState(null)
  const [progress, setProgress]         = useState(0)
  const [showCreate, setShowCreate]     = useState(false)
  const [createType, setCreateType]     = useState('text')
  const [selectedBg, setSelectedBg]     = useState(NEON_GRADIENTS[0])
  const [storyText, setStoryText]       = useState('')
  const [storyFile, setStoryFile]       = useState(null)
  const [storyCaption, setStoryCaption] = useState('')
  const [creating, setCreating]         = useState(false)
  const timerRef    = useRef(null)
  const fileInputRef = useRef(null)

  const user        = auth.currentUser
  const userInitial = (user?.displayName || user?.email || 'V').charAt(0).toUpperCase()
  const userName    = user?.displayName || user?.email?.split('@')[0] || 'You'

  useEffect(() => { fetchStories() }, [])

  const fetchStories = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(60))
      )
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      setStories(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(s => (s.createdAt?.toDate?.()?.getTime() ?? 0) > cutoff)
      )
    } catch (err) { console.error('stories fetch:', err) }
  }

  // Progress timer
  useEffect(() => {
    if (!viewing) return
    setProgress(0)
    clearInterval(timerRef.current)
    const tick = 50
    timerRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (STORY_DURATION / tick))
        if (next >= 100) {
          clearInterval(timerRef.current)
          setTimeout(() => setViewing(null), 80)
          return 100
        }
        return next
      })
    }, tick)
    return () => clearInterval(timerRef.current)
  }, [viewing])

  const closeViewer = () => { clearInterval(timerRef.current); setViewing(null) }

  const handleCreate = async () => {
    if (creating) return
    if (createType === 'text' && !storyText.trim()) return
    if (createType === 'photo' && !storyFile) return
    setCreating(true)
    try {
      let imageURL = null
      if (createType === 'photo' && storyFile) {
        const fileRef = ref(storage, `stories/${user.uid}_${Date.now()}`)
        await uploadBytes(fileRef, storyFile)
        imageURL = await getDownloadURL(fileRef)
      }
      const payload = {
        uid:        user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        text:       createType === 'text' ? storyText.trim() : storyCaption.trim(),
        bgColor:    createType === 'text' ? selectedBg : null,
        imageURL,
        createdAt:  serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'stories'), payload)
      setStories(prev => [{ id: docRef.id, ...payload, createdAt: { toDate: () => new Date() } }, ...prev])
      setStoryText(''); setStoryCaption(''); setStoryFile(null)
      setSelectedBg(NEON_GRADIENTS[0]); setShowCreate(false)
    } catch (err) { console.error('story create:', err) }
    finally { setCreating(false) }
  }

  const resetCreate = () => {
    setShowCreate(false); setStoryText(''); setStoryCaption('')
    setStoryFile(null); setCreateType('text'); setSelectedBg(NEON_GRADIENTS[0])
  }

  return (
    <>
      {/* ── Stories strip ── */}
      <div className="stories-bar">

        {/* Add story */}
        <button className="story-card story-card-add" onClick={() => setShowCreate(true)}>
          <div
            className="story-add-avatar"
            style={avatarStyle(user?.displayName || user?.email || 'V')}
          >{userInitial}</div>
          <div className="story-add-plus">+</div>
          <span className="story-card-name">Add story</span>
        </button>

        {/* Existing stories */}
        {stories.map(s => (
          <button
            key={s.id}
            className="story-card"
            onClick={() => setViewing(s)}
            style={s.imageURL
              ? { backgroundImage: `url(${s.imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: s.bgColor || 'var(--card)' }
            }
          >
            <div className="story-card-avatar-wrap">
              <span className="avatar avatar-sm" style={avatarStyle(s.authorName)}>
                {(s.authorName || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {s.text && !s.imageURL && (
              <p className="story-card-inner-text">{s.text}</p>
            )}
            <div className="story-card-footer">
              <span className="story-card-name">{(s.authorName || '').split(' ')[0]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Story viewer ── */}
      {viewing && (
        <div className="story-viewer-backdrop" onClick={closeViewer}>

          <div className="story-viewer-shell" onClick={e => e.stopPropagation()}>
            {/* Progress */}
            <div className="story-progress-track">
              <div className="story-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Author */}
            <div className="story-viewer-author">
              <span className="avatar avatar-sm" style={avatarStyle(viewing.authorName)}>
                {(viewing.authorName || 'U').charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="story-viewer-author-name">{viewing.authorName}</div>
                <div className="story-viewer-author-time">{timeAgo(viewing)}</div>
              </div>
            </div>

            {/* Close */}
            <button className="story-viewer-close" onClick={closeViewer}>✕</button>

            {/* Content */}
            <div
              className="story-viewer-content"
              style={!viewing.imageURL ? { background: viewing.bgColor || '#1a2035' } : {}}
            >
              {viewing.imageURL && (
                <img src={viewing.imageURL} alt="" className="story-viewer-img" />
              )}
              {viewing.text && (
                <p className={`story-viewer-text${viewing.imageURL ? ' over-image' : ''}`}>
                  {viewing.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create story modal ── */}
      {showCreate && (
        <div className="story-create-backdrop" onClick={resetCreate}>
          <div className="story-create-modal" onClick={e => e.stopPropagation()}>

            <div className="story-create-header">
              <h3>Create a story</h3>
              <button className="story-create-close" onClick={resetCreate}>✕</button>
            </div>

            {/* Type tabs */}
            <div className="story-create-tabs">
              <button
                className={`story-tab-btn${createType === 'text' ? ' active' : ''}`}
                onClick={() => setCreateType('text')}
              >🎨 Neon text</button>
              <button
                className={`story-tab-btn${createType === 'photo' ? ' active' : ''}`}
                onClick={() => setCreateType('photo')}
              >📷 Photo</button>
            </div>

            {createType === 'text' ? (
              <>
                <div className="story-preview" style={{ background: selectedBg }}>
                  <p>{storyText || 'Your text will appear here…'}</p>
                </div>
                <div className="story-color-row">
                  {NEON_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      className={`story-color-dot${selectedBg === g ? ' active' : ''}`}
                      style={{ background: g }}
                      onClick={() => setSelectedBg(g)}
                    />
                  ))}
                </div>
                <textarea
                  className="story-textarea"
                  placeholder="Write something…"
                  value={storyText}
                  onChange={e => setStoryText(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
              </>
            ) : (
              <>
                <div className="story-photo-zone" onClick={() => fileInputRef.current?.click()}>
                  {storyFile ? (
                    <img src={URL.createObjectURL(storyFile)} alt="" className="story-photo-thumb" />
                  ) : (
                    <div className="story-photo-placeholder">
                      <span>🖼️</span>
                      <span>Click to choose a photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setStoryFile(e.target.files[0] || null)}
                />
                <input
                  type="text"
                  className="story-caption-input"
                  placeholder="Add a caption… (optional)"
                  value={storyCaption}
                  onChange={e => setStoryCaption(e.target.value)}
                  maxLength={150}
                />
              </>
            )}

            <button
              className="story-submit-btn"
              onClick={handleCreate}
              disabled={creating || (createType === 'text' ? !storyText.trim() : !storyFile)}
            >
              {creating ? 'Sharing…' : '✨ Share to story'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default StoriesBar
