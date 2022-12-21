import { getUser, getToken } from "../utils/requests"
import { useState, useEffect } from 'react'
import Live from "./Live"
import Marker from "./Marker"
import Hotkey from "./Hotkey"
import { User } from '../types/User'


//Main Screen that renders most other components and response data as props to them
function Main() {
    const [user, setUser] = useState<User>()
    let token = getToken()

    useEffect(() => {
        async function loadUser() {
            const newUser = await getUser(token)
            setUser(newUser)
            console.log(newUser)
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
            <Live id={user?.id}/>
            <Marker />
            <Hotkey />
            <div className="shoutout flex flex-wrap max-w-sm font-bold text-slate-300 text-center">
                <p className="mr-1 text-xl">Made by</p>
                <a className="text-xl text-violet-300 hover:text-violet-200" href="https://www.twitch.tv/futuuure_" target="_blank" rel="noopener noreferrer">twitch.tv/futuuure_</a>
            </div>
        </div>
    )
}


export default Main