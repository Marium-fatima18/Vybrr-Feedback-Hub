import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, auth } from '../Firebase'
import './Style.css'

const CATEGORIES = ['Tech', 'Design', 'Dev', 'Career', 'Tutorial', 'Opinion', 'News']

function Submit() {
    const navigate = useNavigate()

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('')
  const [tags, setTags]               = useState('')
  const [image, setImage]             = useState(null)
  const [preview, setPreview]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
  }

  const handleSubmit = async () => {
    setError('')

    const currentUser = auth.currentUser
    if (!currentUser) {
      return setError('You must be signed in to publish a post.')
    }

    if (!title.trim())       return setError('Title is required.')
    if (!description.trim()) return setError('Description is required.')
    if (!category)           return setError('Please select a category.')

    setLoading(true)

    try {
      let imageURL = null

      if (image) {
        const imageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${image.name}`)
        await uploadBytes(imageRef, image)
        imageURL = await getDownloadURL(imageRef)
      }

      const tagsArray = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

      const docRef = await addDoc(collection(db, 'posts'), {
        title:       title.trim(),
        description: description.trim(),
        category,
        tags:        tagsArray,
        imageURL,
        authorId:    currentUser.uid,
        authorName:  currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Anonymous'),
        authorEmail: currentUser.email || '',
        createdAt:   serverTimestamp(),
        likes:       0,
        comments:    0,
      })

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="submit-page">
      <div className="submit-inner">

        <div className="submit-header">
          <h1 className="submit-title">Create a post</h1>
          <p className="submit-sub">Share your ideas with the Vybrr community</p>
        </div>

        <div className="submit-form">

          {/* Title */}
          <div className="submit-field">
            <label>Title <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Give your post a clear, catchy title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          {/* Description */}
          <div className="submit-field">
            <label>Description <span className="required">*</span></label>
            <textarea
              placeholder="Write your post content here..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={7}
              maxLength={2000}
            />
            <span className="char-count">{description.length}/2000</span>
          </div>

          {/* Category + Tags */}
          <div className="submit-row">
            <div className="submit-field">
              <label>Category <span className="required">*</span></label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={category ? '' : 'placeholder'}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="submit-field">
              <label>Tags</label>
              <input
                type="text"
                placeholder="react, firebase, css  (comma separated)"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="submit-field">
            <label>Cover image</label>
            {!preview ? (
              <label className="upload-zone" htmlFor="image-upload">
                <div className="upload-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <p className="upload-label">Click to upload an image</p>
                <p className="upload-hint">PNG, JPG, WEBP up to 5MB</p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div className="upload-preview">
                <img src={preview} alt="preview" />
                <button className="remove-image" onClick={removeImage}>✕ Remove</button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <p className="submit-error">{error}</p>}

          {/* Actions */}
          <div className="submit-actions">
            <button
              className="submit-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="submit-loading">
                  <span className="spinner" /> Publishing...
                </span>
              ) : 'Publish post →'}
            </button>
            <button
              className="submit-btn-ghost"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Submit