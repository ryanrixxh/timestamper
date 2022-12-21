import axios from 'axios'

//Utility functions to make requests to the Twitch API
//Seperated to prevent overcomplicating component code

//Request configuration

export async function getName(token: string) {
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
    return response.data.data[0].display_name
}

// export async function getId(token: string) {
    
// }

// export async function getStatus(token: string) {

// }