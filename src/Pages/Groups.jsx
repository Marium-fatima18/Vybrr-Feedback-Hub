import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, arrayUnion, arrayRemove, orderBy, query } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../Firebase'
import { avatarStyle } from '../utils/avatarColor'
import './Style.css'

function Groups() {
  const [user] = useAuthState(auth)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'groups'), orderBy('createdAt', 'desc')))
        setGroups(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Error fetching groups:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      const newGroup = {
        name: name.trim(),
        description: description.trim(),
        createdBy: user.uid,
        creatorName: user.displayName || user.email?.split('@')[0] || 'User',
        members: [user.uid],
        createdAt: serverTimestamp(),
      }
      const ref = await addDoc(collection(db, 'groups'), newGroup)
      setGroups(prev => [{ id: ref.id, ...newGroup, createdAt: new Date() }, ...prev])
      setName('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      console.error('Error creating group:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (group) => {
    try {
      await updateDoc(doc(db, 'groups', group.id), { members: arrayUnion(user.uid) })
      setGroups(prev => prev.map(g =>
        g.id === group.id ? { ...g, members: [...(g.members || []), user.uid] } : g
      ))
    } catch (err) { console.error('Error joining group:', err) }
  }

  const handleLeave = async (group) => {
    try {
      await updateDoc(doc(db, 'groups', group.id), { members: arrayRemove(user.uid) })
      setGroups(prev => prev.map(g =>
        g.id === group.id ? { ...g, members: (g.members || []).filter(m => m !== user.uid) } : g
      ))
    } catch (err) { console.error('Error leaving group:', err) }
  }

  return (
    <div className="page-wrap groups-wrap">

      <div className="groups-header">
        <div>
          <h1>Groups</h1>
          <p>Join communities and share with people who share your interests.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="group-create-form">
          <h3>New group</h3>
          <input
            className="group-input"
            placeholder="Group name *"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
          />
          <textarea
            className="group-input"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn-primary" disabled={creating || !name.trim()}>
            {creating ? 'Creating…' : 'Create Group'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="feed-skeleton">Loading groups…</div>
      ) : groups.length === 0 ? (
        <div className="feed-empty-card">No groups yet. Be the first to create one!</div>
      ) : (
        <div className="groups-list">
          {groups.map(group => {
            const isMember = (group.members || []).includes(user?.uid)
            return (
              <div key={group.id} className="group-card">
                <div className="group-card-avatar" style={avatarStyle(group.name)}>{group.name[0].toUpperCase()}</div>
                <div className="group-card-body">
                  <Link to={`/group/${group.id}`} className="group-card-name">{group.name}</Link>
                  {group.description && <p className="group-card-desc">{group.description}</p>}
                  <span className="group-card-meta">{(group.members || []).length} members</span>
                </div>
                <div className="group-card-actions">
                  {isMember
                    ? <button className="group-btn group-btn-leave" onClick={() => handleLeave(group)}>Leave</button>
                    : <button className="group-btn group-btn-join"  onClick={() => handleJoin(group)}>Join</button>
                  }
                  <Link to={`/group/${group.id}`} className="group-btn group-btn-view">View →</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Groups
