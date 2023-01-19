import axios from 'axios'

let client

export function createClient(token_input) {
  client = axios.create({
    baseURL: 'https://api.twitch.tv/helix/',
    timeout: 1000,
    headers: {
        'Authorization': 'Bearer ' + token_input ,
        'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        'Content-Type': 'application/json',
    }
  })
}

export async function createLiveListener(id?: string) {
  let ws_id
  const socket = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws')
  //needs a check to see if the message is a welcome or subscription message
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.metadata.message_type === 'session_welcome') {
        ws_id = message.payload.session.id

        const body: any = {
            "type": "stream.online",
            "version": "1",
            "condition": {
                "broadcaster_user_id": id
            },
            "transport": {
                "method": "websocket",
                "session_id": ws_id,
            }
        }
        client.post('/eventsub/subscriptions', body)
    } else {
        console.log(message)
    }
  }
}

export async function getUserData() {
  const response = await client.get('/users')
  return response.data.data[0]
}