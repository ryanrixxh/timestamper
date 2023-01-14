import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'


function App() {
  console.log('JS is printing!')
  listen('hello-event', (event) => {
    console.log(event)
  })

  return (
    <div className="App">
      <div className="card">
        <button onClick={async () => { invoke('twitch_auth_flow') }}>
          Login
        </button>
      </div>
    </div>
  )
}

export default App