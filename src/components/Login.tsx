 import { v4 as uuid } from 'uuid'

//Authorization URL
function buildURL(): string {
    const state = uuid()
    var href = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0&redirect_uri=http://localhost:3000/logged&scope=channel%3Amanage%3Abroadcast&state=1'
    href += state
    return href
}

//First screen that a user sees upon entering the app
function Login() {
    const link = buildURL()
    return (
        <div className="helloDiv">
            <h1 id="loginHeader" className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
                <a href={link}>Login to Twitch</a>
            </h1>
        </div>
    )
}

export default Login