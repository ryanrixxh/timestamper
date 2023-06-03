import { readText } from '@tauri-apps/api/clipboard'
import { validateToken } from '../utils/api'
import '../styles/common.css'

function PasteBin(props) {
   
    async function readClipboard() {
        await readText().then(async (token) => {
            await validateToken(token).then((valid) => {
                if (valid) {
                    props.onTokenRecieve(token)
                } else {
                    // TODO: Handle an invalid token error
                    console.error("Token invalid")
               }            
            })
        })
    }

    return (
        <div>
            <button className='modeButton' onClick={readClipboard}>Paste</button>
        </div>
    )
}

export default PasteBin