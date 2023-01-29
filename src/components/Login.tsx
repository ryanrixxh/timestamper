import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'

async function setLogged(store: Store) {
  await store.set('logged', { value: false})
}

async function getLogged(store: Store) {
  const val = await store.get('logged')
  console.log(val)
}

function Login({ sendToApp }) {
  const store = new Store(".settings.dat")
  // setLogged(store)
  getLogged(store)

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
