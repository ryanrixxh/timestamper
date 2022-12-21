import { useState, useEffect } from 'react'
import { getStatus, getToken } from "../utils/requests"
import { User, Stream } from '../utils/interfaces'

let offline: Stream = {
    game_name: '',
    title: '',
}

function Live(user: User) {
    const [streamDetails, setStreamDetails] = useState<Stream>()
    const [live, setLive] = useState<string>()
    let token = getToken()

    useEffect(() => {
        async function loadStatus() {
            if(user?.login) {
                const newDetails = await getStatus(token, user?.login)
                // TODO - Add other states to display more details
                console.log(newDetails)
                setLive(newDetails ? 'Live' : 'Offline')
                if(newDetails) {
                    setStreamDetails(newDetails)
                } else {
                    setStreamDetails(offline)
                }
            }
        }
        loadStatus()
    }, [token, user?.login])

    return (
        <div className="liveDiv">
            <h1 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-right">
                { live }
            </h1>
            <h2 className="text-2xl font-bold text-slate-300 hover:text-slate-200 text-right">
                Playing: { streamDetails?.game_name }
            </h2>
            <h2 className="text-2xl font-bold text-slate-300 hover:text-slate-200 text-right">
                Title: { streamDetails?.title }
            </h2>
        </div>
    )
}

export default Live