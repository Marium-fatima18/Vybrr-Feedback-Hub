import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, googleProvider, githubProvider } from "../Firebase";
import './Style.css'

function Auth() {
  const [mode, setMode]         = useState("login"); // "login" | "signup"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [user, authLoading]     = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const showMsg = (text, type = "error") => setMessage({ text, type });

  const validate = () => {
    if (!email || !password) { showMsg("Please enter email and password."); return false; }
    if (password.length < 6)  { showMsg("Password must be at least 6 characters."); return false; }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") showMsg("This email is already registered. Try logging in.");
      else if (err.code === "auth/invalid-email")   showMsg("Please enter a valid email address.");
      else showMsg("Sign up failed. Please try again.");
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        showMsg("Incorrect email or password.");
      else if (err.code === "auth/invalid-email")
        showMsg("Please enter a valid email address.");
      else
        showMsg("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (err) {
      showMsg("Google login failed. Please try again.");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential")
        showMsg("An account already exists with this email using a different sign-in method.");
      else
        showMsg("GitHub login failed. Please try again.");
    }
  };

  const handleSubmit = () => mode === "login" ? handleLogin() : handleSignup();

  if (!authLoading && user) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">

        {/* Brand pane */}
        <div className="auth-brand">
          <h1 className="auth-brand-logo">Vybrr</h1>
          <p className="auth-brand-tagline">
            Connect with people, share what you know, and discover
            ideas from a community that thinks like you.
          </p>
        </div>

        {/* Login / signup card */}
        <div className="auth-card">
          {/* Toggle */}
          <div className="auth-toggle">
            <button
              className={`auth-toggle-btn ${mode === "login" ? "auth-toggle-active" : ""}`}
              onClick={() => { setMode("login"); setMessage({ text: "", type: "" }) }}
            >
              Log in
            </button>
            <button
              className={`auth-toggle-btn ${mode === "signup" ? "auth-toggle-active" : ""}`}
              onClick={() => { setMode("signup"); setMessage({ text: "", type: "" }) }}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <div className="auth-form">
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <button className="auth-submit-btn" onClick={handleSubmit}>
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <p className={`auth-message ${message.type === "success" ? "msg-success" : "msg-error"}`}>
              {message.text}
            </p>
          )}

          <div className="auth-divider"><span>or continue with</span></div>

          {/* Social */}
          <div className="auth-social">
            <button onClick={handleGoogleLogin} className="auth-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button onClick={handleGithubLogin} className="auth-social-btn">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="auth-footer-toggle">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage({ text: "", type: "" }) }}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Auth;
