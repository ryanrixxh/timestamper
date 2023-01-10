import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { WebviewWindow } from '@tauri-apps/api/window'
import reactLogo from './assets/react.svg'
import './App.css'

async function createWindow() {
  const webview = new WebviewWindow('login', {
    url: '../index.html',
  })

  webview.once('tauri://created', function () {
    console.log("success")
    invoke('changeUrl')
  })

  webview.once('tauri://error', function (e) {
    console.log(e)
})
}

function App() {
  console.log('JS is printing!')
  listen('hello-event', (event) => {
    console.log(event)
  })

  return (
    <div className="App">
      <div className="card">
        <button onClick={async () => { await createWindow() }}>
          Login
        </button>
      </div>
    </div>
  )
}

export default App
