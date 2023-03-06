import { useState, useEffect } from "react"
import { invoke } from '@tauri-apps/api/tauri'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import {writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs'
import { postMarker } from "../utils/api"
import { Store } from 'tauri-plugin-store-api'
import _ from 'lodash'

let timestamps: string[] = []

async function saveHotkey(store: Store, hotkey: String) {
    await store.set('hotkey', { value: hotkey})
}

//Checks local AppData for a timestamps folder
async function checkForFolder() {
    const dirExists = await exists('timestamps', { dir: BaseDirectory.AppLocalData})
    if (dirExists === false) {
        await createDir('timestamps', {dir: BaseDirectory.AppLocalData, recursive: true})
    }
}

function Marker(props) {
    const [hotkey, setHotkey] = useState<string>('start')
    const [count, setCount] = useState(0)
    const [manualTime, setManualTime] = useState({seconds: 0, minutes: 0, hours: 0})

    //TODO: Needs to track the manual time
    function startTimer() {
        
    }
    
    //TODO: invoke a rust filesystem writing function
    async function writeMarkerToFs() {
        const newTimestamp = manualTime.hours + ':' + manualTime.minutes + ':' + manualTime.seconds
        timestamps.push(newTimestamp)
        console.log(timestamps)
        let timestampString = timestamps.toString()
        let formatted = timestampString.replaceAll(',', '\n')
        await writeTextFile('timestamps/timestamps.txt', formatted, {dir: BaseDirectory.AppLocalData})
    }

    //Invokes rust keyboard listener
    async function getShortcut() {
        await invoke('listen_for_keys').then((message) => {
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
        //TODO: register needs to trigger hooks by updating count rather than do thing itself
        setCount(count => count + 1)
    })

    setHotkey(current_hotkey)
    saveHotkey(props.store, current_hotkey)
    }

    //Loads the shortcut from the store
    async function loadShortcut() {
        const val: any = await props.store.get('hotkey')
        const savedHotkey: string = (val.value !== null) ? val.value : ''
        setHotkey(savedHotkey)
        changeShortcut(savedHotkey)
    }

    //Load the shortcut on first page load
    useEffect(() => {
        loadShortcut()
        checkForFolder()
    }, [])

    //Whenever the count is updated, trigger the creation of a timestamp
    useEffect(() => {
        if (props.online === true) {
            postMarker(props.user_id)
        }
        writeMarkerToFs()
    }, [count])

    //TODO: The interval of this timer needs to start on a button press, not first load
    useEffect(() => {
        const seconds_id = setInterval(() => {
            setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds++}))
        }, 1000)
        return () => {
            clearInterval(seconds_id)
        }
    }, [])
    useEffect(() => {
        if (manualTime.seconds === 59) {
            setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds = 0}))
            setManualTime(manualTime => ({...manualTime, minutes: ++manualTime.minutes}))
        }
        if (manualTime.minutes === 59) {
            setManualTime(manualTime => ({...manualTime, minutes: manualTime.minutes = 0}))
            setManualTime(manualTime => ({...manualTime, hours: ++manualTime.hours}))
        }

    }, [manualTime.seconds, manualTime.minutes, hotkey])

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
            <button onClick={writeMarkerToFs}>Click</button>
        </div>
    ) 
}

export default Marker