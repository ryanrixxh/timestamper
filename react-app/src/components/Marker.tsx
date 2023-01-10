import { createMarker } from "../utils/requests"
import { User } from '../utils/interfaces'

function Marker(user: User) {
    return (
        <div className="createMarker">
            <h2 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center" onClick={async () => {await createMarker(user?.id)}}>
            Create Marker
            </h2>
        </div>
    )
}

export default Marker