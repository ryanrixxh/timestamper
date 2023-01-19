import { useState, useEffect, useReducer } from 'react'
import { createClient, getUserData, postEventSub } from '../utils/api'
import { User, Stream } from '../utils/interfaces'

function Home(props) {
  const [user, setUser] = useState<User>()
  const [stream, setStream] = useState<Stream>()

  // Websocket to listen for changes in stream status
  
  async function createLiveListener(id?: string) {
    let ws_id
    const socket = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws')
    //needs a check to see if the message is a welcome or subscription message
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.metadata.message_type === 'session_welcome') {
          ws_id = message.payload.session.id
  
          const body: any = {
              "type": "channel.update",
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
          console.log(message.payload.event)
          setStream(message.payload.event)
      }
    }
  }

  useEffect(() => { 
    createClient(props.token)
    async function getUser() {
      const user = await getUserData()
      setUser(user)
    }
    getUser()
  }, [])

  // When user value changes from undefined make a websocket connection
  useEffect(() => {
    if(user?.id) {
      console.log(user)
      createLiveListener(user?.id)
    }
  }, [user])
  
  return (
    <div className="App">
      <div className="card">
        <h1 className="text-3xl font-bold">
          Hello {user?.display_name}
        </h1>
        <h2> Your current title is: {stream?.title}</h2>
      </div>
    </div>
  )
}

export default Home
