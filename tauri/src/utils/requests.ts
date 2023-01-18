import { getClient } from '@tauri-apps/api/http'


let headers

export function setToken(token_input) {
    headers = {
        'Authorization': 'Bearer ' + token_input,
        'Client-Id': 'v89m5cded20ey1ppxxsi5ni53c3rv0',
        'Content-Type': 'application/json'
      }
}

export async function getUserData() {
  const client = await getClient()
  const response = await client.get('https://api.twitch.tv/helix/users', {
    headers: headers
  })
  let userData: any = response.data
  return userData.data[0]
}

export async function getStatus() {
  const client = await getClient()
}