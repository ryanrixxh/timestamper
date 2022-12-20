import './stylesheets/App.css';
import './components/Hotkey.tsx'
import Hotkey from './components/Hotkey';
import Login from './components/Login';

function App() {
  return (
    <div className="App bg-neutral-500 h-screen">
      <Login />
      <div className="createMarker">
        <h2 className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center">
          Create Marker
        </h2>
      </div>
      <Hotkey />
      <div className="liveDiv">
        <h1 className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
          Live
        </h1>
      </div>
    </div>
  );
}

export default App;
