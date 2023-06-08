import { readText } from '@tauri-apps/api/clipboard'
import { validateToken } from '../utils/api'
import '../styles/pastebin.css'

function PasteBin(props) {
   
    async function readClipboard() {
        await readText().then(async (token) => {
            let valid = await validateToken(token)
            if (valid) {
                props.onTokenRecieve(token)
            } else {
                // TODO: Error needs to show to the user
                console.error("Token invalid")
                cancel()
            }            
        })
    }

    function cancel() {
        props.cancel('cancelled')
    }

    return (
        <div className='pasteBinBackdrop'>
            <div className='buttonWrapper'>
                <button className='modeButton pasteButton' onClick={readClipboard}>Paste</button>
                <button className='cancelButton' onClick={cancel}>Cancel</button>
            </div>
        </div>
    )
}

export default PasteBin