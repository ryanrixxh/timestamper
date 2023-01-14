import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { emit, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import Login from './Login'
import Home from './Home'


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />}>
          <Route path="home" element={<Home />}/>
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
