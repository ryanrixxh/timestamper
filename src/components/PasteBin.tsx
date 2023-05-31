import { readText } from '@tauri-apps/api/clipboard'
import '../styles/common.css'

function PasteBin({onTokenRecieve}) {
    async function readClipboard() {
        await readText().then((token) => {
            onTokenRecieve(token)
        })
    }

    //TODO: Needs input validation of the copied text

    return (
        <div>
            <button className='modeButton' onClick={readClipboard}>Paste</button>
        </div>
    )
}

export default PasteBin