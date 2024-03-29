import { useState, useEffect } from 'react'
import { authUrl } from '../utils/api'

import '../styles/login.css'
import PasteBin from './PasteBin'

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

  async function saveToken(token: string) {
    setToken(token)
    await props.store.set('token', { value: token})
  }

  async function getToken() {
    let token: string = (await props.store.get('token')).value
    if (token != undefined) {
      setToken(token)
    }
  }

  function handleCancel() {
    setLoggingIn(false)
  }

  useEffect(() => {
    props.loginMessage(token)
  }, [token])

  useEffect(() => {
    getToken()
  }, [])

  return (
    <div>
      <div className="titleBackdrop">
        
        <div className="titleCard">
          <h1 className="title">Timestamper</h1>
          <h2 className="tagline">Capture the moment. Stay in the moment.</h2>
        </div>
        
        { !loggingIn && 
        <div className="buttonCard">
          <a href={authUrl} target='_blank'>
            <button className="modeButton online" onClick={startLoginProcess}>
              Login
            </button>
          </a>
          <button className="modeButton offline" onClick={skipAuth}>
            Offline
          </button>
        </div> }

        { loggingIn && 
        <PasteBin onTokenRecieve={saveToken} cancel={handleCancel}/> }
      </div>

    <a href="https://www.twitch.tv/futuuure_" target="_blank" className="shoutout">Made by futuuure</a>
    </div>
  )
}

export default Login
