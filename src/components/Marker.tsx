import { createMarker, getToken } from "../utils/requests"
import { User } from '../utils/interfaces'

function Marker(user: User) {
    let token = getToken()

    return (
        <div className="createMarker">
            <h2 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center" onClick={async () => {await createMarker(token, user?.id)}}>
            Create Marker
            </h2>
        </div>
    )
}

export default Marker