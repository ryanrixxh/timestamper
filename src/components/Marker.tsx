import { useState, useEffect } from "react"
import { invoke } from '@tauri-apps/api/tauri'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import {writeTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { postMarker } from "../utils/api"
import { Store } from 'tauri-plugin-store-api'


async function saveHotkey(store: Store, hotkey: String) {
    await store.set('hotkey', { value: hotkey})
}

//TODO: invoke a rust filesystem writing function
async function writeMarkerToFs() {
    await writeTextFile('timestampsfromtauri.txt' , 'this is some text', {dir: BaseDirectory.Document})
}

function Marker(props) {
    const [hotkey, setHotkey] = useState<string>('')
    const [count, setCount] = useState(0)
    const [manualTime, setManualTime] = useState({seconds: 0, minutes: 0, hours: 0})

    //Tracks the manual time
    function startTimer() {
        
    }

    //Invokes rust keyboard listener
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
    let current_hotkey = newHotkey

    // This logic is ran when the hotkey is pressed
    await register(newHotkey, async () => {
        postMarker(props.user_id)
        setCount(count => count + 1)
        await writeMarkerToFs()
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

    //Mounted
    useEffect(() => {
        loadShortcut()
    }, [])


    useEffect(() => {
        const seconds_id = setInterval(() => setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds++})), 1000)
        return () => {
            clearInterval(seconds_id)
        }
    }, [])
    useEffect(() => {
        if (manualTime.seconds === 59) {
            manualTime.seconds = -1
            manualTime.minutes++
        }
        if (manualTime.minutes === 59) {
            manualTime.minutes = -1
            manualTime.hours
        }
    }, [manualTime.seconds, manualTime.minutes])

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
            <h2>Manual Timer: {manualTime.hours}:{manualTime.minutes}:{manualTime.seconds}</h2>
        </div>
    ) 
}

export default Marker