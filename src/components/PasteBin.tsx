import { readText } from '@tauri-apps/api/clipboard'

function PasteBin() {

    //TODO: Needs to invoke a Rust function to read the clipboard
    async function readClipboard() {
        await readText().then((text) => {
            console.log(text)
        })
    }

    //TODO: Needs input validation of the copied text

    return (
        <div>
            <button onClick={readClipboard}>Paste</button>
        </div>
    )
}

export default PasteBin