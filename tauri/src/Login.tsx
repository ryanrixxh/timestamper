import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'


function Login() {
  
  //Recieve token from Rust backend and set
  //TODO: This may actually not be needed. Depends if we wanna keep invoking rust to handle the http requests or just use React. 
  //Look at performace to see which will be better. 
  async function auth() {
    await invoke('twitch_auth_flow').then((message) => {
      console.log("Rust sent: ", message)
      setToken(message as any)
    }
  )}

  const [token, setToken] = useState("empty")

  return (
    <div className="App">
      <div className="card">
        <button onClick={auth}>
          Login + {token}
        </button>
      </div>
    </div>
  )
}

export default Login
