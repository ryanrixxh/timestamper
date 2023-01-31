import { useState, useContext } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import Login from './components/Login'
import Home from './components/Home'
import { validateToken, revokeToken } from './utils/api'


function App() {
  const [pageState, setPageState] = useState('Login')
  const [authToken, setAuthToken] = useState('empty')

  import.meta.env.VITE_LOGGED = false
  const sendToApp = (token: string) => {
    validateToken(token)
    if(token !== 'empty' && token.length > 0) {
      setAuthToken(token)
      setPageState('Home')
    }
  }
  
  return (
    <div>
      { pageState === 'Login' && <Login sendToApp={sendToApp}/>}
      { pageState === 'Home' && <Home token={authToken}/> }
    </div>
  )
}

export default App
