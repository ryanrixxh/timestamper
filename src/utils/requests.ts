import axios from 'axios'

//Utility functions to make requests to the Twitch API
//Seperated to prevent overcomplicating component code
const client = axios.create({
    baseURL: 'https://api.twitch.tv/helix/',
    timeout: 1000,
    headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        'Content-Type': 'application/json',
    }
})

//Utility to grab token from response_uri
export function getToken(): string {
    const fullToken = window.location.hash
    let tokenStart = fullToken.indexOf("=") + 1
    let tokenEnd = fullToken.indexOf("&")
    let token = fullToken.slice(tokenStart, tokenEnd)
    return token
}

//Gets the display name of the streamer
export async function getUser() {
    const response = await client.get('/users')
    return response.data.data[0]
}

//Gets the live status of the streamer. Returns undefined if offline
export async function getStatus(login: string) {
    const response = await client.get('/streams?user_login=' + login)
    return response.data.data[0]
}

export async function createMarker(id?: string) {
    //TODO - request headers arent being sent for some reason. Axios
    let reqId = id ? id : ''
    var body: any = {
        'user_id': reqId,
        'description': 'Marker from Timestamper'
    }
    const response = await client.post('https://api.twitch.tv/helix/streams/markers',body)
    console.log(response)
    return response
}