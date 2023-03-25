import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'
import '../styles/login.css'


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

  //Skips the login process with twitch. The prop given to the home component will enforce lack of rendering.
  function skipAuth() {
    props.loginMessage("offline")
  }

  return (
    <div className="App">
      <div className="backdrop">
        <h1 className="title">Timestamper</h1>
        <h2 className="tagline">Capture the moment. Stay in the moment</h2>
        <button className="modeButton online buttonShadow"/>
        <button className="modeButton online" onClick={auth}>
          Login
        </button>
        <button className="modeButton offline buttonShadow"/>
        <button className="modeButton offline" onClick={skipAuth}>
          Offline
        </button>
      </div>
    </div>
  )
}

export default Login
