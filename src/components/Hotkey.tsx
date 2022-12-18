import '../stylesheets/Hotkey.css'

function getHotkey(): string {
    var hotkey = "Alt + F5"
    return hotkey
}

function Hotkey() {
    return (
        <div className="hotkeyWrap flex">
        <div className="text-4xl font-bold text-slate-300 hover:text-slate-200 text-center"> Hotkey Set: </div>
        <div className="hotkeyDisplay text-2xl bg-neutral-600 text-slate-300 hover:text-slate-200 text-center border-solid border-2 rounded-md ml-4 px-5 py-1">{ getHotkey() }</div>
        </div>
    )
}


export default Hotkey