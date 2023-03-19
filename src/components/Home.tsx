import { useState, useEffect } from 'react'
import { createClient, getStreamData, getUserData, postEventSub, postMarker } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { Store } from 'tauri-plugin-store-api'
import Info from './Info'
import Marker from './Marker'

function Home(props) {
  // Store keeps persisent data
  const store: Store = new Store(".settings.dat")
  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()
  const [live, setLive] = useState<boolean>(false)
  const [delay, setDelay] = useState<number>(0)

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
      // When a welcome message is sent, establish the subscription type
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
      } else if (message.metadata.message_type === 'notification') {   
          // Handle the ws messages based on subscription type
          switch (message.metadata.subscription_type) {
            case 'stream.online': {
              console.log('stream has gone online')
              let start_time: Date = new Date(message.payload.event.started_at)
              setDelay(formatTime(start_time))
              setLive(true)
              getStream(user?.id)
            } 
            break
            case 'stream.offline': {
              console.log('stream has gone offline')
              setDelay(0)
              setLive(false)
            }
            break
            default: {}
          }

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
      createWebsocket(user?.id, 'stream.online')
      createWebsocket(user?.id, 'stream.offline')
    }
  }, [user])
  
  return (
    <div className="App">
        { live === true &&  <h2>You are live!</h2> }
        { live === false && <h2>Offline</h2> }
        
        {props.online === true && <Info display_name={user?.display_name} 
                                        game_name={stream?.game_name} 
                                        title={stream?.title}/>  }

        <Marker user_id={user?.id} 
                store={store} 
                online={props.online} 
                delay={delay}
                live={live}/>

        <button className="text-xl border" onClick={logout}>Logout</button>
    </div>
  )
}

async function setLogged(store: Store, logStatus: Boolean) {
  await store.set('logged', { value: logStatus})
}

function formatTime(time: Date): number {
  let start: number = time.valueOf()
  let now: number = Date.now().valueOf()
  let gap = (now - start) / 1000
  gap = Math.round(gap)
  return gap
}

export default Home
