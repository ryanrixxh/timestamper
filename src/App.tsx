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
  const loginMessage = (token: string) => {
    getStatus()
    console.log(token)
    if(token == 'logged out') {
      setPageState('Login')
      revokeToken(authToken)
    } else if(token !== 'logged out' && token.length > 0) {
        validateToken(token)
        setAuthToken(token)
        setPageState('Home')
    }
  }
  
  return (
    <div>
      { pageState === 'Login' && <Login loginMessage={loginMessage}/>}
      { pageState === 'Home' && <Home token={authToken} loginMessage={loginMessage}/> }
    </div>
  )
}

export default App
