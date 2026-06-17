import React from 'react'

function Button({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  loadingText = 'Loading...', 
  variant = 'primary' 
}) {
  return (
    <button
      className={`submit-btn-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="submit-loading">
          <span className="spinner" /> {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button