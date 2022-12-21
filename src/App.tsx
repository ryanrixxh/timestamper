import './stylesheets/App.css'
import Hotkey from './components/Hotkey'
import Login from './components/Login'
import Logged from './components/Logged'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="App bg-neutral-500 h-screen">
        {/* TODO - convert to component for route rendering */}
        <div className="createMarker">
          <h2 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center">
            Create Marker
          </h2>
        </div>
        {/* TODO - convert to component for route rendering */}
        <div className="liveDiv">
          <h1 className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
            Live
          </h1>
        </div>
        <div className="shoutout flex flex-wrap max-w-sm font-bold text-slate-300 text-center">
          <p className="mr-1 text-xl">Made by</p>
          <a className="text-xl text-violet-300 hover:text-violet-200" href="https://www.twitch.tv/futuuure_"> twitch.tv/futuuure_</a>
        </div>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/logged' element={<><Logged /><Hotkey /></>} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
