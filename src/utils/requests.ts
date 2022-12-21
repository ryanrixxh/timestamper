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

//Gets the live status of the streamer
export async function getStatus(token: string,id: string) {
    var config = {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        }
    }

    const response = await axios.get(
        'https://api.twitch.tv/helix/streams?' + id,
        config
    )
    return response.data.data[0]
}