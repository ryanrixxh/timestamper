import { useState, useEffect } from "react"
import { invoke } from '@tauri-apps/api/tauri'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import {writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs'
import { getStartTime, postMarker } from "../utils/api"
import { Store } from 'tauri-plugin-store-api'
import _ from 'lodash'

let timestamps: string[] = []
let date = new Date()

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
    const [timer, setTimer] = useState(false)

    function switchTimer() {
        if(timer === true) {
            setTimer(false)
        } else {
            setTimer(true)
        }
    }
    function resetTimer() {
        setTimer(false)
        setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds = 0, 
                                                     minutes: manualTime.minutes = 0,
                                                     hours: manualTime.hours = 0}))
    }
    
    async function writeMarkerToFs() {
        const newTimestamp = manualTime.hours + ':' + manualTime.minutes + ':' + manualTime.seconds
        timestamps.push(newTimestamp)
        console.log(timestamps)
        let timestampString = timestamps.toString()
        let formatted = timestampString.replaceAll(',', '\n')
        await writeTextFile('timestamps/' + date.toDateString() + '.txt', formatted, {dir: BaseDirectory.AppLocalData})
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
        try {
            await register(newHotkey, async () => {
                // This logic is ran when the hotkey is pressed
                setCount(count => count + 1)
            })
        } catch(e) {
            if(typeof e === 'string' && e.includes('already registered')) { 
            } else { 
                throw e 
            }
        }
        
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
        if (count > 0) {
            if (props.online === true) {
                postMarker(props.user_id)
            } else if (timer === true) {
                writeMarkerToFs()
            } else {
                setCount(count => --count)
            }         
        }
    }, [count])

    //TODO: The interval of this timer needs to start on a button press, not first load
    useEffect(() => {
        if (timer === true) {
            const seconds_id = setInterval(() => {
                setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds++}))
            }, 1000)
            return () => {
                clearInterval(seconds_id)
            }
        }
    }, [timer])
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
            <button className="border" onClick={switchTimer}>Start/Stop Timer</button>
            <button className="border" onClick={resetTimer}>Reset</button>
        </div>
    ) 
}

export default Marker