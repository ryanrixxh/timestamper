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



export async function getUserData() {
  const response = await client.get('/users')
  return response.data.data[0]
}

export async function getStreamData(id: any) {
  const request = '/channels?broadcaster_id=' + id
  const response = await client.get(request)
  return response.data.data[0]
}

export async function postEventSub(body: any) {
  client.post('/eventsub/subscriptions', body)
}