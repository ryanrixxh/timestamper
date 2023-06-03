import { readText } from '@tauri-apps/api/clipboard'
import { validateToken } from '../utils/api'
import '../styles/pastebin.css'

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

    function cancel() {
        console.log('cancelling!')
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