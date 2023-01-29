import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'
import { v } from '@tauri-apps/api/event-2a9960e7'

async function setLogged(store: Store) {
  await store.set('logged', { value: false})
}


function Login({ sendToApp }) {
  const store = new Store(".settings.dat")

  const [token, setToken] = useState("empty")

  async function auth() {
    const val: any = await store.get('logged')
    const status: Boolean = val.value
    await invoke('twitch_auth_flow', {logged: status}).then((message) => {
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
