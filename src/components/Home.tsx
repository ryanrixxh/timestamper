import { useState, useEffect, useReducer } from 'react'
import { createClient, getStreamData, getUserData, postEventSub, postMarker } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'
import Info from './Info'

// TODO: Split content of home into several components
async function setLogged(store: Store, logStatus: Boolean) {
  await store.set('logged', { value: logStatus})
}

async function saveHotkey(store: Store, hotkey: String) {
  await store.set('hotkey', { value: hotkey})
}


function Home(props) {

  // Store keeps persisent data
  const store = new Store(".settings.dat")

  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()
  const [hotkey, setHotkey] = useState<string>('')
  const [count, setCount] = useState(0)


  async function logout() {
    setLogged(store, false)
    props.loginMessage("logged out")
  } 

  async function getShortcut() {
    await invoke('listen_for_keys').then((message) => {
      console.log(message)
      if (message == 'Cancelled') {
        return
      }
      changeShortcut(message as string)
    })
  }

  async function changeShortcut(newHotkey: string) {
    await unregister(hotkey)

    let current_hotkey = newHotkey
    await register(newHotkey, () => {
      postMarker(user?.id)
      setCount(count => count + 1)
    })

    setHotkey(current_hotkey)
    saveHotkey(store, current_hotkey)
  }

  //Loads the shortcut from the store
  async function loadShortcut() {
    const val: any = await store.get('hotkey')
    const savedHotkey: string = (val.value !== null) ? val.value : ''
    setHotkey(savedHotkey)
  }

  // Websocket to listen for changes in stream status
  async function getUser() {
    const user = await getUserData()
    setUser(user)
  }

  async function getStream(id: any) {
    const stream = await getStreamData(id)
    setStream(stream)
  }

  async function createWebsocket(id: string, eventType: string) {
    let ws_id
    const socket = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws')
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.metadata.message_type === 'session_welcome') {
          ws_id = message.payload.session.id
  
          const body: any = {
              "type": eventType,
              "version": "1",
              "condition": {
                  "broadcaster_user_id": id
              },
              "transport": {
                  "method": "websocket",
                  "session_id": ws_id,
              }
          }
        postEventSub(body)
      } else if (message.metadata.message_type !== 'session_keepalive') {
          getStream(user?.id)
      }
    }
  }

  useEffect(() => { 
    createClient(props.token)
    getUser()
    loadShortcut()
  }, [])

  // When user value changes from undefined make a websocket connection
  useEffect(() => {
    if(user?.id) {
      console.log(user)
      getStream(user?.id)
      createWebsocket(user?.id, "channel.update") // TODO: Use stream.online when testing is done
    }
  }, [user])
  
  return (
    <div className="App">
      <div className="card">
        <Info display_name={user?.display_name} 
              game_name={stream?.game_name} 
              title={stream?.title}/>
        
        <h1 className="text-3xl font-bold mt-4">
          Marker Hotkeys
        </h1>
        <button className="text-xl border" onClick={getShortcut}>Set Hotkey</button>
        <h2>Your hotkey is: {hotkey}</h2>

        <h1 className="text-3xl font-bold mt-4">
          Stats
        </h1>
        <h2>You have made {count} markers this stream!</h2>
        <button className="text-xl border" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

export default Home
