import { useState, useEffect } from 'react'
import { createClient, getStreamData, getUserData, postEventSub, postMarker } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { Store } from 'tauri-plugin-store-api'
import Info from './Info'
import Marker from './Marker'

function Home(props) {
  // Store keeps persisent data
  const store = new Store(".settings.dat")
  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()

  async function logout() {
    setLogged(store, false)
    props.loginMessage("logged out")
  } 

  async function getUser() {
    const user = await getUserData()
    setUser(user)
  }

  async function getStream(id: any) {
    const stream = await getStreamData(id)
    setStream(stream)
  }

    // Websocket to listen for changes in stream status
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
          let start_time: Date = new Date(message.payload.event.started_at)
          formatTime(start_time)
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

  // When user value changes from undefined grab all required
  useEffect(() => {
    if(user?.id) {
      getStream(user?.id)
      createWebsocket(user?.id, "stream.online") // TODO: Use stream.online when testing is done
    }
  }, [user])
  
  return (
    <div className="App">
        {props.online === true && <Info display_name={user?.display_name} 
                                        game_name={stream?.game_name} 
                                        title={stream?.title}
                                        start_time={stream?.start_time}/>  }

        <Marker user_id={user?.id} store={store} online={props.online}/>
        <button className="text-xl border" onClick={logout}>Logout</button>
    </div>
  )
}

async function setLogged(store: Store, logStatus: Boolean) {
  await store.set('logged', { value: logStatus})
}

function formatTime(time: Date) {
  let start: number = time.valueOf()
  let now: number = Date.now().valueOf()
  let gap = (now - start) / 1000
  console.log(gap, 'second delay')
}

export default Home
