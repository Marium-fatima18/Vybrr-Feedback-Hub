import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Explore from './Explore'
import Dashboard from './Dashboard'
import Submit from './Submit'
import Auth from './Auth'
import Errorpage from './Errorpage'

function Routepages() {
  return (
    <Routes>
      <Route path='/'          element={<Home />} />
      <Route path='/explore'   element={<Explore />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/submit'    element={<Submit />} />
      <Route path='/auth'      element={<Auth />} />
      <Route path='*'          element={<Errorpage />} />
    </Routes>
  )
}

export default Routepages