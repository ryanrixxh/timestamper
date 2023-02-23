import { useState, useEffect } from "react"
import { invoke } from '@tauri-apps/api/tauri'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import { postMarker } from "../utils/api"
import { Store } from 'tauri-plugin-store-api'


async function saveHotkey(store: Store, hotkey: String) {
    await store.set('hotkey', { value: hotkey})
}

async function writeMarkerToFs() {}

function Marker(props) {
    const [hotkey, setHotkey] = useState<string>('')
    const [count, setCount] = useState(0)

    async function getShortcut() {
        await invoke('listen_for_keys').then((message) => {
          console.log(message)
          if (message == 'Cancelled') {
            return
          }
          changeShortcut(message as string)
        })
      }
    
    async function changeShortcut(newHotkey: string) {
    await unregister(hotkey)

    //TODO: Actually maybe the conditional can just be here. 
    //      If user is logged in then postMarker if not then dont
    //      If user has selected write option then write to filesystem (needs a rust function)
    let current_hotkey = newHotkey

    //Whatever is in this function is ran whenever the hotkey is pressed
    await register(newHotkey, () => {
        postMarker(props.user_id)
        setCount(count => count + 1)
    })

    setHotkey(current_hotkey)
    saveHotkey(props.store, current_hotkey)
    }

    //Loads the shortcut from the store
    async function loadShortcut() {
        const val: any = await props.store.get('hotkey')
        const savedHotkey: string = (val.value !== null) ? val.value : ''
        console.log('setting hotkey', savedHotkey)
        setHotkey(savedHotkey)
        changeShortcut(savedHotkey)
    }

    useEffect(() => {
        loadShortcut()
    }, [])

    return(
        <div>
            <h1 className="text-3xl font-bold mt-4">
            Marker Hotkeys
            </h1>
            <button className="text-xl border" onClick={getShortcut}>Set Hotkey</button>
            <h2>Your hotkey is: {hotkey}</h2>

            <h1 className="text-3xl font-bold mt-4">
            Stats
            </h1>
            <h2>You have made {count} markers this stream!</h2>
        </div>
    ) 
}

export default Marker