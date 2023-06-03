import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'
import '../styles/login.css'

import PasteBin from './PasteBin'
import { authUrl } from '../utils/api'


async function setLoggedTrue(store: Store) {
  await store.set('logged', { value: true})
}

function Login(props) {
  const [token, setToken] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  //Skips the login process with twitch. The prop given to the home component will enforce lack of rendering.
  function skipAuth() {
    props.loginMessage("offline")
  }

  function startLoginProcess() {
    setLoggingIn(true)
  }

  function saveToken(token: string) {
    console.log('Login component sees: ', token)
    setToken(token)
  }

  useEffect(() => {
    props.loginMessage(token)
  }, [token])

  return (
    <div>
      <div className="titleBackdrop">
        
        <div className="titleCard">
          <h1 className="title">Timestamper</h1>
          <h2 className="tagline">Capture the moment. Stay in the moment.</h2>
        </div>
        
        { !loggingIn && 
        <div className="buttonCard">
          <a href='https://google.com' target='_blank'>
            <button className="modeButton online" onClick={startLoginProcess}>
              Login
            </button>
          </a>
          <button className="modeButton offline" onClick={skipAuth}>
            Offline
          </button>
        </div> }

        { loggingIn && 
        <PasteBin onTokenRecieve={saveToken}/> }
      </div>

    <a href="https://www.twitch.tv/futuuure_" target="_blank" className="shoutout">Made by futuuure</a>
      
    </div>
  )
}

export default Login
