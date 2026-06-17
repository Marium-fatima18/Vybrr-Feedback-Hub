import { Link } from 'react-router-dom'
import './Style.css'

function Errorpage() {
  return (
    <div className="page-wrap error-wrap">
      <div className="error-code">404</div>
      <h1>This page isn't available</h1>
      <p>The link may be broken, or the page may have been removed.</p>
      <Link to="/" className="btn-primary">Go to feed</Link>
    </div>
  )
}

export default Errorpage
