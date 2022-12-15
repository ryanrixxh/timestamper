import './stylesheets/App.css';

function App() {
  return (
    <div className="App bg-neutral-500 h-screen">
      <div className="helloDiv">
        <h1 className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
          Login to Twitch
        </h1>
      </div>
      <div className="liveDiv">
        <h1 className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
          Live
        </h1>
      </div>
    </div>
  );
}

export default App;
