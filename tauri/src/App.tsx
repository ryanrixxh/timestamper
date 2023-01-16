import { useState, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import Login from './Login'
import Home from './Home'


function App() {
  const [pageState, setPageState] = useState('Login')
  const [authToken, setAuthToken] = useState('empty')


  const sendToApp = (token: string) => {
    console.log(token)
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
