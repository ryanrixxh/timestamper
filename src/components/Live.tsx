import { useState, useEffect } from 'react'
import { getStatus, getToken } from "../utils/requests"
import { User } from '../utils/interfaces'

function Live(user: User) {
    const [live, setLive] = useState<String>()
    let token = getToken()

    useEffect(() => {
        async function loadStatus() {
            if(user?.login) {
                const newStatus = await getStatus(token, user?.login)
                // TODO - Add other states to display more details
                setLive(newStatus ? 'Live' : 'Offline')
            }
        }
        loadStatus()
    }, [token, user?.login])

    return (
        <div className="liveDiv">
            <h1 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center">
                { live }
            </h1>
        </div>
    )
}

export default Live