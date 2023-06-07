import { useState, useEffect } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import Login from './components/Login'
import Home from './components/Home'
import { revokeToken, validateToken } from './utils/api'
import { getLocalToken } from './utils/storage'
import { Store } from 'tauri-plugin-store-api'



function App() {
  const store: Store = new Store(".settings.dat")
  const [pageState, setPageState] = useState('Login')
  const [authToken, setAuthToken] = useState('')
  const [online, setOnline] = useState(false)


  import.meta.env.VITE_LOGGED = false
  
  function loginMessage(message: string) {
    if(message === 'logged out') {
      setPageState('Login')
      if (online === true) {
        setOnline(false)
      }
    } else if(message === 'offline') {
      setPageState('Home')
      setOnline(false)
    } else if(message !== 'logged out' && message.length > 0) {
        let token = message
        validateToken(token).then((valid) => {
          if (valid) {
            setAuthToken(token)
            setOnline(true)
            setPageState('Home')
          }
        })
    }
  }
  
  return (
    <div>
      { pageState === 'Login' && <Login loginMessage={loginMessage}
                                        store={store}/> }
      
      { pageState === 'Home' && <Home token={authToken} 
                                      loginMessage={loginMessage} 
                                      online={online}
                                      store={store} /> }
    </div>
  )
}

export default App
