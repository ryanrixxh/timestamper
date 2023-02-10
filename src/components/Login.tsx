import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'

async function setLoggedTrue(store: Store) {
  await store.set('logged', { value: true})
}

function Login(props) {

  const [token, setToken] = useState("empty")

  async function auth() {
    const store = new Store(".settings.dat")
    const val: any = await store.get('logged')
    const status: Boolean = val.value
    await invoke('twitch_auth_flow', {logged: status}).then((message) => {
      setToken(message as any)
      props.loginMessage(message as any)
    })
    //TODO: Needs a check to see if the auth actually succeeds
    setLoggedTrue(store)
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
