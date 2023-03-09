import { useState, useEffect, useReducer } from 'react'
import { createClient, getStartTime, getStreamData, getUserData, postEventSub, postMarker } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import { invoke } from '@tauri-apps/api/tauri'
import { Store } from 'tauri-plugin-store-api'
import Info from './Info'
import Marker from './Marker'


async function setLogged(store: Store, logStatus: Boolean) {
  await store.set('logged', { value: logStatus})
}


function Home(props) {
  // Store keeps persisent data
  const store = new Store(".settings.dat")
  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()

  async function logout() {
    setLogged(store, false)
    props.loginMessage("logged out")
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

  async function getStart(id: any) {
    const start = await getStartTime(id)
    console.log(start)
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
    if (props.online) {
      createClient(props.token)
      getUser()
    }
  }, [])

  // When user value changes from undefined make a websocket connection
  useEffect(() => {
    if(user?.id) {
      console.log(user)
      getStream(user?.id)
      getStartTime(user?.id)
      createWebsocket(user?.id, "channel.update") // TODO: Use stream.online when testing is done
    }
  }, [user])
  
  return (
    <div className="App">
        {props.online === true && <Info display_name={user?.display_name} 
                                        game_name={stream?.game_name} 
                                        title={stream?.title}/>  }

        <Marker user_id={user?.id} store={store} online={props.online}/>
        <button className="text-xl border" onClick={logout}>Logout</button>
    </div>
  )
}

export default Home
