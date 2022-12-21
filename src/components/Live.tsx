import { useState, useEffect } from 'react'
import { getStatus, getToken } from "../utils/requests"
import { User, Stream } from '../utils/interfaces'
import LiveImage from '../assets/live-icon.png'

let offline: Stream = {
    game_name: '',
    title: '',
}

//Displays live status of the user & broadcast details
function Live(user: User) {
    const [streamDetails, setStreamDetails] = useState<Stream>()
    const [live, setLive] = useState<string>()
    let token = getToken()

    useEffect(() => {
        async function loadStatus() {
            if(user?.login) {
                const newDetails = await getStatus(user?.login)
                // TODO - Add other states to display more details
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
        <div className="liveDiv max-w-m">       
            { live === 'Live' && 
            <div>
                <div className='flex flex-row-reverse'>
                    <img src={LiveImage} alt='live icon' width='50' height='50'></img>
                    <h1 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-right">
                        { live }
                    </h1>
                </div>
                <h2 className="text-2xl font-bold text-slate-300 hover:text-slate-200 text-right">
                    Playing: { streamDetails?.game_name }
                </h2> 
                <h2 className="text-m font-bold text-slate-300 hover:text-slate-200 text-right">
                    Title: { streamDetails?.title }
                </h2>
            </div>
            } 
            { live === 'Offline' &&
                <h1 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-right">
                    { live }
                </h1> 
            }

        </div>
    )
}

export default Live