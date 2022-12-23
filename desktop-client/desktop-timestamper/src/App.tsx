import './stylesheets/App.css'
import Login from './components/Login'
import Main from './components/Main'
import { Routes, Route, HashRouter } from 'react-router-dom'


function App() {
  return (
    <HashRouter>
      <div className="App bg-neutral-500 h-screen">
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/logged' element={<><Main /></>} />
        </Routes>
        <div className="shoutout flex flex-wrap max-w-sm font-bold text-slate-300 text-center">
            <p className="mr-1 text-xl">Made by</p>
            <a className="text-xl text-violet-300 hover:text-violet-200" href="https://www.twitch.tv/futuuure_" target="_blank" rel="noopener noreferrer">twitch.tv/futuuure_</a>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
