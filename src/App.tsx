import './stylesheets/App.css'
import Login from './components/Login'
import Main from './components/Main'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="App bg-neutral-500 h-screen">
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/logged' element={<><Main /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
