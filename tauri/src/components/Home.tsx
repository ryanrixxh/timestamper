import { useState, useEffect, useReducer } from 'react'
import { setToken, getUserData } from '../utils/requests'
import { User, Stream } from '../utils/interfaces'


function Home(props) {
  const [user, setUser] = useState<User>()

  useEffect(() => { 
    setToken(props.token)
    async function getUser() {
      const user = await getUserData()
      setUser(user)
    }
    getUser()
  }, [])
   return (
    <div className="App">
      <div className="card">
        <h1>
          Hello {user?.display_name}
        </h1>
      </div>
    </div>
  )
}

export default Home
