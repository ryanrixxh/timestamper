import { useState, useContext } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import Login from './components/Login'
import Home from './components/Home'
import { validateToken, revokeToken } from './utils/api'
import { Store } from 'tauri-plugin-store-api'

async function getStatus() {
  const store = new Store('.settings.dat')
  console.log(await store.get('logged'))
}

function App() {
  const [pageState, setPageState] = useState('Login')
  const [authToken, setAuthToken] = useState('empty')


  import.meta.env.VITE_LOGGED = false
  let online: boolean
  
  const loginMessage = (message: string) => {
    getStatus()
    if(message == 'logged out') {
      setPageState('Login')
      revokeToken(authToken)
    } else if(message == 'offline') {
      setPageState('Home')
      online = false
    } else if(message !== 'logged out' && message.length > 0) {
        let token = message
        validateToken(token)
        setAuthToken(token)
        online = true
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
