import { getUser, getToken } from "../utils/requests"
import { useState, useEffect } from 'react'
import Live from "./Live"
import Marker from "./Marker"
import Hotkey from "./Hotkey"
import { User } from '../utils/interfaces'


//Main Screen that renders most other components and response data as props to them
function Main() {
    const [user, setUser] = useState<User>()
    let token = getToken()

    useEffect(() => {
        async function loadUser() {
            const newUser = await getUser(token)
            setUser(newUser)
        }
        loadUser()
    }, [token])
    
    return (  
        <div >  
            <div className="loggedDiv">
                <h1 id="loginHeader" className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
                    Welcome { user?.display_name }
                </h1>
            </div>
            <Live login={user?.login}/>
            <Marker />
            <Hotkey />
        </div>
    )
}


export default Main