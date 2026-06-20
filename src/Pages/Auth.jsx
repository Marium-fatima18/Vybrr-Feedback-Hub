import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, googleProvider, githubProvider } from "../Firebase";
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase'
import './Style.css'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GithubIcon = () => (
  <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
)

function Auth() {
  const [mode, setMode]             = useState("login");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [dob, setDob]               = useState("");
  const [gender, setGender]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage]       = useState({ text: "", type: "" });
  const [busy, setBusy]             = useState(false);
  const [busySource, setBusySource] = useState(null); // 'submit' | 'google' | 'github'

  const [user, authLoading] = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const showMsg = (text, type = "error") => setMessage({ text, type });

  const validate = () => {
    if (!email || !password) { showMsg("Please enter email and password."); return false; }
    if (password.length < 6) { showMsg("Password must be at least 6 characters."); return false; }
    if (mode === "signup") {
      if (!firstName.trim()) { showMsg("First name is required."); return false; }
      if (!lastName.trim())  { showMsg("Last name is required.");  return false; }
      if (!dob)              { showMsg("Date of birth is required."); return false; }
      if (!gender)           { showMsg("Please select your gender."); return false; }
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate() || busy) return;
    setBusy(true); setBusySource('submit');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (["auth/user-not-found","auth/wrong-password","auth/invalid-credential"].includes(err.code))
        showMsg("Incorrect email or password.");
      else showMsg("Login failed. Please try again.");
      setBusy(false); setBusySource(null);
    }
  };

  const handleSignup = async () => {
    if (!validate() || busy) return;
    setBusy(true); setBusySource('submit');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usersTable2', user.uid), {
        uid: user.uid, email: user.email,
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(), lastName: lastName.trim(),
        dob, gender, createdAt: serverTimestamp(),
      });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") showMsg("This email is already registered.");
      else showMsg("Sign up failed. Please try again.");
      setBusy(false); setBusySource(null);
    }
  };

  // Skip Firestore round-trip for returning OAuth users via localStorage flag
  const ensureUserDoc = async (oauthUser) => {
    const cacheKey = `vybrr-synced-${oauthUser.uid}`
    if (localStorage.getItem(cacheKey)) return
    const ref = doc(db, 'usersTable2', oauthUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const [first = '', ...rest] = (oauthUser.displayName || '').split(' ')
      await setDoc(ref, {
        uid: oauthUser.uid, email: oauthUser.email,
        displayName: oauthUser.displayName || oauthUser.email?.split('@')[0] || 'User',
        firstName: first, lastName: rest.join(' '),
        dob: '', gender: '', createdAt: serverTimestamp(),
      })
    }
    localStorage.setItem(cacheKey, '1')
  }

  const handleGoogleLogin = async () => {
    if (busy) return;
    setBusy(true); setBusySource('google');
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(result.user)
      navigate(from, { replace: true })
    } catch {
      showMsg("Google login failed.")
      setBusy(false); setBusySource(null);
    }
  };

  const handleGithubLogin = async () => {
    if (busy) return;
    setBusy(true); setBusySource('github');
    try {
      const result = await signInWithPopup(auth, githubProvider)
      await ensureUserDoc(result.user)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential")
        showMsg("Account exists with a different sign-in method.");
      else showMsg("GitHub login failed.");
      setBusy(false); setBusySource(null);
    }
  };

  const handleSubmit = () => mode === "login" ? handleLogin() : handleSignup();
  if (!authLoading && user) return <Navigate to={from} replace />

  return (
    <div className="auth-layout">

      {/* ── Left brand panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-brand-wordmark">Vybrr</div>
          <h1 className="auth-brand-headline">Your community,<br />amplified.</h1>
          <p className="auth-brand-sub">
            Share ideas, gather real feedback, and connect with people who care about the same things you do.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">💬</span>
              <span>Open discussions on any topic</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">👥</span>
              <span>Private groups for your communities</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">❤️</span>
              <span>Real feedback from real people</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form side ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-brand">Vybrr</div>
          <h2 className="auth-card-heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-card-subheading">
            {mode === "login" ? "Sign in to continue" : "Join the community today"}
          </p>

          <div className="auth-toggle">
            <button
              className={`auth-toggle-btn ${mode === "login" ? "auth-toggle-active" : ""}`}
              onClick={() => { if (!busy) { setMode("login"); setMessage({ text: "", type: "" }) } }}
            >Log in</button>
            <button
              className={`auth-toggle-btn ${mode === "signup" ? "auth-toggle-active" : ""}`}
              onClick={() => { if (!busy) { setMode("signup"); setMessage({ text: "", type: "" }) } }}
            >Sign up</button>
          </div>

          <div className="auth-form">
            <input type="email" className="auth-input" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={busy} />

            <div className="auth-password-field">
              <input type={showPassword ? "text" : "password"} className="auth-input"
                placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={busy} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)} disabled={busy}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === "signup" && (
              <>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" className="auth-input" placeholder="First name"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    style={{ flex: 1, minWidth: 0 }} disabled={busy} />
                  <input type="text" className="auth-input" placeholder="Last name"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    style={{ flex: 1, minWidth: 0 }} disabled={busy} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-3)', paddingLeft: '2px' }}>Date of Birth</label>
                  <input type="date" className="auth-input" value={dob}
                    onChange={e => setDob(e.target.value)} disabled={busy} />
                </div>
                <select className="auth-input" value={gender}
                  onChange={e => setGender(e.target.value)}
                  style={{ appearance: 'auto' }} disabled={busy}>
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </>
            )}

            <button className="auth-submit-btn" onClick={handleSubmit} disabled={busy}>
              {busySource === 'submit'
                ? <><Loader2 size={18} className="auth-spinner" /> {mode === "login" ? "Signing in…" : "Creating account…"}</>
                : (mode === "login" ? "Sign in" : "Create account")
              }
            </button>
          </div>

          {message.text && (
            <p className={`auth-message ${message.type === "success" ? "msg-success" : "msg-error"}`}>
              {message.text}
            </p>
          )}

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="auth-social">
            <button onClick={handleGoogleLogin} className="auth-social-btn" disabled={busy}>
              {busySource === 'google'
                ? <Loader2 size={18} className="auth-spinner" />
                : <GoogleIcon />
              }
              {busySource === 'google' ? 'Signing in…' : 'Google'}
            </button>
            <button onClick={handleGithubLogin} className="auth-social-btn" disabled={busy}>
              {busySource === 'github'
                ? <Loader2 size={18} className="auth-spinner" />
                : <GithubIcon />
              }
              {busySource === 'github' ? 'Signing in…' : 'GitHub'}
            </button>
          </div>

          <p className="auth-footer-toggle">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { if (!busy) { setMode(mode === "login" ? "signup" : "login"); setMessage({ text: "", type: "" }) } }}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
