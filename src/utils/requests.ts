import axios from 'axios'

export async function getName(token: string) {
    let config = {
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