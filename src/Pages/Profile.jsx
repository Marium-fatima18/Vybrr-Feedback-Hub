import { useEffect, useState } from "react";
import { auth, db } from "../Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { avatarStyle } from '../utils/avatarColor'
import './Style.css'

function Profile() {
  const [user, authLoading] = useAuthState(auth);
  const [profileData, setProfileData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', gender: '', bio: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }

    const fetchUserProfile = async () => {
      try {
        setDataLoading(true);
        const docSnap = await getDoc(doc(db, "usersTable2", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setForm({
            firstName: data.firstName || '',
            lastName:  data.lastName  || '',
            dob:       data.dob       || '',
            gender:    data.gender    || '',
            bio:       data.bio       || '',
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) fetchUserProfile();
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updates = {
        firstName:   form.firstName.trim(),
        lastName:    form.lastName.trim(),
        displayName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        dob:         form.dob,
        gender:      form.gender,
        bio:         form.bio.trim(),
      };
      await updateDoc(doc(db, "usersTable2", user.uid), updates);
      setProfileData(prev => ({ ...prev, ...updates }));
      setEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: profileData?.firstName || '',
      lastName:  profileData?.lastName  || '',
      dob:       profileData?.dob       || '',
      gender:    profileData?.gender    || '',
      bio:       profileData?.bio       || '',
    });
    setEditMode(false);
  };

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  if (authLoading || dataLoading) {
    return (
      <div className="profile-loading">
        <Loader2 className="profile-spinner" size={40} />
        <p>Loading your profile…</p>
      </div>
    );
  }

  const displayName = profileData?.displayName
    || `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim()
    || user?.displayName
    || user?.email?.split('@')[0]
    || 'Member';
  const avatarLetter = (
    form.firstName ||
    profileData?.firstName ||
    user?.displayName ||
    user?.email ||
    'V'
  )[0].toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Banner */}
        <div className="profile-banner" />

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-lg" style={avatarStyle(user?.displayName || user?.email || 'V')}>{avatarLetter}</div>
        </div>

        {/* Name / edit name inputs */}
        <div className="profile-identity">
          {editMode ? (
            <div className="profile-name-inputs">
              <input className="profile-input" placeholder="First name" {...bind('firstName')} />
              <input className="profile-input" placeholder="Last name"  {...bind('lastName')}  />
            </div>
          ) : (
            <h2 className="profile-name">{displayName}</h2>
          )}
          <span className="profile-badge">Member</span>
        </div>

        <hr className="profile-divider" />

        {/* Info fields */}
        <div className="profile-fields">
          <div className="profile-field profile-field--full">
            <label>Email</label>
            <p>{profileData?.email || user?.email}</p>
          </div>

          <div className="profile-field">
            <label>Date of Birth</label>
            {editMode
              ? <input type="date" className="profile-input" {...bind('dob')} />
              : <p>{profileData?.dob || 'Not provided'}</p>
            }
          </div>

          <div className="profile-field">
            <label>Gender</label>
            {editMode
              ? (
                <select className="profile-input" {...bind('gender')}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              )
              : <p>{profileData?.gender || 'Not specified'}</p>
            }
          </div>
        </div>

        {/* Bio */}
        <div className="profile-bio-section">
          <label>Bio</label>
          {editMode
            ? (
              <textarea
                className="profile-input profile-bio-input"
                placeholder="Tell the community about yourself…"
                rows={3}
                {...bind('bio')}
              />
            )
            : (
              <div className="bio-box">
                <p>{profileData?.bio || "No bio yet. Click Edit Profile to add one!"}</p>
              </div>
            )
          }
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </>
          ) : (
            <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
