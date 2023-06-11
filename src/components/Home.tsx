import { useState, useEffect } from 'react'
import { createClient, getStreamData, getUserData, postEventSub, revokeToken } from '../utils/api'
import { User, Stream } from '../utils/interfaces'
import { HiCog6Tooth } from 'react-icons/hi2'
import Info from './Info'
import Marker from './Marker'
import Options from './Options'

import '../styles/home.css'

function Home(props) {
  const [user, setUser] = useState<User>() 
  const [stream, setStream] = useState<Stream>() 
  const [live, setLive] = useState<boolean>(false) 
  const [delay, setDelay] = useState<number>(0) 
  const [optionsOn, setOptionsOn] = useState<boolean>(false) 

  const exitMessage = props.online ? "Logout" : "Exit"
  
  function formatTime(time: Date): number {
    let start: number = time.valueOf()
    let now: number = Date.now().valueOf()
    let gap = (now - start) / 1000
    gap = Math.round(gap)
    return gap
  }

  async function logout() {
    await props.store.set('token', { value: undefined})
    revokeToken(props.token)
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
    const socket = new WebSocket('wss://eventsub.wss.twitch.tv/ws')
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

  function showOptions() {
    console.log('Showing options')
    setOptionsOn(!optionsOn)
  }

  useEffect(() => { 
    if (props.online) {
      // console.log(props.token)
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
    <div>
      <div className="backdrop">
        <HiCog6Tooth id='settingsCog' onClick={showOptions}/>
        { props.online && !optionsOn && 
         <Info display_name={user?.display_name} 
                                   game_name={stream?.game_name} 
                                   title={stream?.title}
                                   live={live}/>  }

        { !optionsOn && 
          <Marker user_id={user?.id} 
                  store={props.store} 
                  online={props.online} 
                  delay={delay}
                  live={live}/> }

        { optionsOn && 
          <Options />}

        <div id="logoutAndShoutout">
          <button id="logoutButton" onClick={logout}>{exitMessage}</button>
          <a href="https://www.twitch.tv/futuuure_" target="_blank" className="shoutout home">Made by futuuure</a>
        </div>

      </div>

    </div>
  )
}

export default Home
