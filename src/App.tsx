import { useState, useContext } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import Login from './components/Login'
import Home from './components/Home'
import { validateToken, revokeToken } from './utils/api'
import { Store } from 'tauri-plugin-store-api'

async function getStatus() {
  const store = new Store('.settings.dat')
}

function App() {
  const [pageState, setPageState] = useState('Login')
  const [authToken, setAuthToken] = useState('empty')
  const [online, setOnline] = useState(false)


  import.meta.env.VITE_LOGGED = false
  
  const loginMessage = (message: string) => {
    getStatus()
    if(message == 'logged out') {
      setPageState('Login')
      if (online === true) {
        revokeToken(authToken)
        setOnline(false)
      }
    } else if(message == 'offline') {
      setPageState('Home')
      setOnline(false)
    } else if(message !== 'logged out' && message.length > 0) {
        let token = message
        validateToken(token)
        setAuthToken(token)
        setOnline(true)
        setPageState('Home')
    }
  }
  
  return (
    <div>
      { pageState === 'Login' && <Login loginMessage={loginMessage}/>}
      { pageState === 'Home' && <Home token={authToken} loginMessage={loginMessage} online={online}/> }
    </div>
  )
}

export default App
