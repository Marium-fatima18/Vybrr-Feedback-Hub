import React from 'react'

function SearchBar({ value, onChange, placeholder = "🔍 Search posts..." }) {
  return (
    <div className="search-wrapper">
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="feed-search-bar"
      />
    </div>
  )
}

export default SearchBar