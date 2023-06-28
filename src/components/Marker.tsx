import { useState, useEffect, useMemo } from "react"
import { invoke } from '@tauri-apps/api/tauri'
import { register, unregister } from '@tauri-apps/api/globalShortcut'
import {writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs'
import { appLocalDataDir } from '@tauri-apps/api/path'
import { postMarker } from "../utils/api"
import _ from 'lodash'
import '../styles/marker.css'



function Marker(props) {
    const [hotkey, setHotkey] = useState<string>('')
    const [hkPrompt, setHkPrompt] = useState<string>('')
    const [listening, setListening] = useState(false) 
    const [count, setCount] = useState<number>(0)
    const [manualTime, setManualTime] = useState({seconds: 0, minutes: 0, hours: 0})
    const [timer, setTimer] = useState(false)
    const [timestamps, setTimestamps] = useState<string[]>([])
    const timerText = useMemo<string>(() => {
        return timer ? 'Stop' : 'Start'
    }, [timer])

    let date = new Date()

    async function showTimestampFolder() {
        await appLocalDataDir().then((path) => {
            invoke('show_in_filesystem' ,{path: path + 'timestamps'})
        })
    } 

    //Checks local AppData for a timestamps folder
    async function checkForFolder() {
        const dirExists = await exists('timestamps', { dir: BaseDirectory.AppLocalData})
        if (dirExists === false) {
            await createDir('timestamps', {dir: BaseDirectory.AppLocalData, recursive: true})
        }
    }

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
    
    //Writes marker to local app data in the filesystem.
    async function writeMarkerToFs() {
        let writeToggled: boolean = (await props.store.get('option-localsave')).value
        console.log('Running writeToggled is: ', writeToggled)
        if (writeToggled) {
            const newTimestamp = manualTime.hours + ':' + manualTime.minutes + ':' + manualTime.seconds
            timestamps.push(newTimestamp)
            let timestampString = timestamps.toString()
            let formatted = timestampString.replaceAll(',', '\n')
            await writeTextFile('timestamps/' + date.toDateString() + '.txt', formatted, {dir: BaseDirectory.AppLocalData})
        } 
    }

    //Invokes rust keyboard listener
    async function getShortcut() {
        setListening(true)
        await invoke('listen_for_keys').then((message) => {
          if (message == 'Cancelled') {
            return
          }
          changeShortcut(message as string)
        }).then(() => {
            setListening(false);
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
        saveHotkey(current_hotkey)

        setHkPrompt(current_hotkey)
    }

    async function saveHotkey(hotkey: String) {
        await props.store.set('hotkey', { value: hotkey})
    }  

    //Loads the shortcut from the store
    async function loadShortcut() {
        const val: any = await props.store.get('hotkey')
        const savedHotkey: string = (val.value !== null) ? val.value : ''
        setHotkey(savedHotkey)
        changeShortcut(savedHotkey)

        setHkPrompt(savedHotkey)
    }

    //Load the shortcut on first page load
    useEffect(() => {
        loadShortcut()
        checkForFolder()
        
    }, [])

    useEffect(() => {
        const backdrop = document.getElementById('markerBackdrop')
        backdrop.style.visibility = props.optionsOn ? 'hidden' : 'visible'
    }, [props.optionsOn])

    //Whenever the count is updated, trigger the creation of a timestamp
    useEffect(() => {
        if (count > 0) {
            if (timer === true) {
                writeMarkerToFs() 
                if (props.online === true) {
                    postMarker(props.user_id)
                }
            } else {
                setCount(count => --count)
            }         
        }
    }, [count])

    //Logic for the manual timer
    useEffect(() => {
        if (timer === true) {
            setManualTime(manualTime => ({...manualTime, seconds: manualTime.seconds + props.delay}))
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

    useEffect(() => {
        if (props.live == true) {
            switchTimer()
        } else if (props.live == false) {
            setCount(0)
            resetTimer()
        }
    }, [props.live])

    return(
        <div id="markerBackdrop" style={{display: props.optionsOn ? 'hidden' : 'visible'}}>
            <section className="hotkeySection">
                <h1 id="hotkeyTitle" className="heading">Hotkey</h1>    
                <button className="hotkeyButton modeButton" 
                        onMouseEnter={() => {setHkPrompt('Change?')} } 
                        onMouseLeave={() => {setHkPrompt(hotkey)}}
                        onClick={getShortcut}>
                        {hkPrompt}
                </button>
                                
                { listening === true && <div className="listenOverlay">LISTENING</div> }
            </section>

            <hr className="divider" />

            <section className="statsSection">
                <h1 id="statsTitle" className="heading">Stats</h1>
                {props.live && <p>You have made {count} markers this stream!</p> }
                <p id="uptime">Uptime:</p>
                <h2 id="timer">{manualTime.hours}:{manualTime.minutes}:{manualTime.seconds}</h2>
                { !props.live && <div> 
                                    { !props.online && <button className="smallButton" onClick={switchTimer}>{timerText}</button> }
                                    { !props.online && <button className="smallButton" onClick={resetTimer}>Reset</button> }
                                </div> }
                <button className="smallButton" onClick={showTimestampFolder}>Show timestamps in folder</button> 
            </section>
        </div>
    ) 
}

export default Marker