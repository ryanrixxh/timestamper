import { useState, useEffect, useReducer } from 'react'
import { createClient, getUserData, createLiveListener } from '../utils/api'
import { User, Stream } from '../utils/interfaces'

function Home(props) {
  const [user, setUser] = useState<User>()

  useEffect(() => { 
    createClient(props.token)
    async function getUser() {
      const user = await getUserData()
      setUser(user)
    }
    getUser()
  }, [])

  // When user value changes from undefined make a websocket connection
  useEffect(() => {
    if(user?.id) {
      console.log(user)
      createLiveListener(user?.id)
    }
  }, [user])
  
  return (
    <div className="App">
      <div className="card">
        <h1 className="text-3xl font-bold">
          Hello {user?.display_name}
        </h1>
      </div>
    </div>
  )
}

export default Home
