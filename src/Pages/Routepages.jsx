import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Explore from './Explore'
import Dashboard from './Dashboard'
import Submit from './Submit'
import Auth from './Auth'
import Profile from './Profile' // 💡 Imported your new Profile page
import Errorpage from './Errorpage'
import PostDetail from './Postdetail'
import Groups from './Groups'
import GroupDetail from './GroupDetail'
import ProtectedRoute from './ProtectedRoute'

function Routepages() {
  return (
    <Routes>
      {/* Public: the login / signup gateway */}
      <Route path='/auth' element={<Auth />} />

      {/* Everything below requires login — unauthenticated users
          are redirected to /auth, so the login page always shows first. */}
      <Route path='/' element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path='/explore' element={
        <ProtectedRoute><Explore /></ProtectedRoute>
      } />
      <Route path='/post/:id' element={
        <ProtectedRoute><PostDetail /></ProtectedRoute>
      } />
      
      {/* 👑 Added Protected Route for the Profile Page */}
      <Route path='/profile' element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />

      <Route path='/groups' element={
        <ProtectedRoute><Groups /></ProtectedRoute>
      } />
      <Route path='/group/:id' element={
        <ProtectedRoute><GroupDetail /></ProtectedRoute>
      } />

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