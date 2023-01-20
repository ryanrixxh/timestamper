import { useState, useEffect, useReducer } from 'react'
import { createClient, getStreamData, getUserData, postEventSub } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { register } from '@tauri-apps/api/globalShortcut'

async function changeShortcut() {
  await register('Shift+C', () => {
    console.log('shortcut triggered!')
  })
}

function Home(props) {

  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()
  const [hotkey, setHotkey] = useState<string>()

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
    //needs a check to see if the message is a welcome or subscription message
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
    changeShortcut()
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
        <h1 className="text-3xl font-bold">
          Hello {user?.display_name}
        </h1>
        <h2> {stream?.game_name} </h2>
        <h2> {stream?.title} </h2>

        <h1 className="text-3xl font-bold mt-4">
          Marker Hotkeys
        </h1>
        <button className="text-xl border">Set Hotkey</button>
        <h2>Your hotkey is: {hotkey}</h2>
      </div>
    </div>
  )
}

export default Home
