import './stylesheets/App.css'
import Login from './components/Login'
import Main from './components/Main'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="App bg-neutral-500 h-screen">
        <div className="shoutout flex flex-wrap max-w-sm font-bold text-slate-300 text-center">
          <p className="mr-1 text-xl">Made by</p>
          <a className="text-xl text-violet-300 hover:text-violet-200" href="https://www.twitch.tv/futuuure_"> twitch.tv/futuuure_</a>
        </div>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/logged' element={<><Main /></>} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
