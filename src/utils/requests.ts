import axios from 'axios'

//Utility functions to make requests to the Twitch API
//Seperated to prevent overcomplicating component code


//Utility to grab token from response_uri
export function getToken(): string {
    const fullToken = window.location.hash
    let tokenStart = fullToken.indexOf("=") + 1
    let tokenEnd = fullToken.indexOf("&")
    let token = fullToken.slice(tokenStart, tokenEnd)
    return token
}

//Gets the display name of the streamer
export async function getUser(token: string) {
    console.log("User details request access token used: ", token)
    var config = {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        }
    }

    const response = await axios.get(
        'https://api.twitch.tv/helix/users',
        config
    )
    return response.data.data[0]
}

//Gets the live status of the streamer. Returns undefined if offline
export async function getStatus(token: string, login: string) {
    console.log("Stream details request access token used: ", token)
    var config = {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        }
    }
    const response = await axios.get(
        'https://api.twitch.tv/helix/streams?user_login=' + login,
        config
    )
    return response.data.data[0]
}

export async function createMarker(token: string, id?: string) {
    //TODO - request headers arent being sent for some reason. Axios thing?
    console.log("Create Marker request access token used: ", token)
    let reqId = id ? id : ''
    var headers: any = {
            'Authorization': 'Bearer ' + token,
            'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
            'Content-Type': 'application/json',
    }
    var body: any = {
        'user_id': reqId,
        'description': 'Marker from Timestamper'
    }
    const response = await axios.post(
        'https://api.twitch.tv/helix/streams/markers',
        body,
        headers,
    )
    console.log(response)
    return response
}