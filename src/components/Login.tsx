import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'



function Login({ sendToApp }) {
  const [token, setToken] = useState("empty")

  async function auth() {
    await invoke('twitch_auth_flow').then((message) => {
      setToken(message as any)
      sendToApp(message as any)
    })
  } 


  return (
    <div className="App">
      <div className="card">
        <button onClick={auth}>
          Login
        </button>
      </div>
    </div>
  )
}

export default Login
