import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './Firebase'
import Navbar from './Pages/Navbar'
import Routepages from './Pages/Routepages'

function App() {
  const [user] = useAuthState(auth)

  return (
    <>
      {/* Top app bar only appears once you're logged in (hidden on the login page) */}
      {user && <Navbar />}
      <Routepages />
    </>
  )
}

export default App
