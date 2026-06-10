import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Explore from './Explore'
import Dashboard from './Dashboard'
import Submit from './Submit'
import Auth from './Auth'
import Errorpage from './Errorpage'
import PostDetail from './Postdetail'
import ProtectedRoute from './ProtectedRoute'   // ← add this

function Routepages() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/explore' element={<Explore />} />
      <Route path='/auth' element={<Auth />} />
      <Route path="/post-detail" element={<PostDetail />} />

      {/* Protected routes */}
      <Route path='/dashboard' element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path='/submit' element={
        <ProtectedRoute><Submit /></ProtectedRoute>
      } />

      <Route path='*' element={<Errorpage />} />
    </Routes>
  )
}

export default Routepages