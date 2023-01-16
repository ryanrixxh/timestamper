import { useState, useEffect } from 'react'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'


function Home(props) {
  console.log(props.token)

  return (
    <div className="App">
      <div className="card">
        <button>
          Home
        </button>
      </div>
    </div>
  )
}

export default Home
