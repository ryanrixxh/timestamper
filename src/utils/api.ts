import axios from 'axios'
import { concat } from 'lodash'

let client

// URL for grabbing tokens
export const authUrl = 'https://id.twitch.tv/oauth2/authorize' + 
                       '?response_type=token' + 
                       '&redirect_uri=http://localhost:5173' + // TODO: Needs to change to configurable variable
                       '&scope=' + encodeURIComponent('channel:manage:polls')


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

// Checks that the token is valid
export async function validateToken(token_input): Promise<boolean> {
  const options = {
    headers: {
      'Authorization': 'Bearer ' + token_input
    }
  } 
  const response = await axios.get("https://id.twitch.tv/oauth2/validate", options)
  console.log(response)
  if (response.status === 200) {
    return true
  } else {
    return false
  }
}

export async function revokeToken(token_input) {
  const params = new URLSearchParams();
  params.append('client_id', 'v89m5cded20ey1ppxxsi5ni53c3rv0')
  params.append('token', token_input)
  const response = await axios.post('https://id.twitch.tv/oauth2/revoke', params)
  console.log(response)
}

// Gets user details (namely id) for other requests to use
export async function getUserData() {
  const response = await client.get('/users')
  return response.data.data[0]
}

// Get stream information (title, catagory etc.)
export async function getStreamData(id: any) {
  const request = '/channels?broadcaster_id=' + id
  const response = await client.get(request)
  return response.data.data[0]
}

// Post request to create a marker
export async function postMarker(id: any) {
  const request = '/streams/markers?user_id=' + id
  const response = await client.post(request)
  console.log(response)
  return response
}


// Post request to determine which websocket event to subscribe to
export async function postEventSub(body: any) {
  client.post('/eventsub/subscriptions', body)
}