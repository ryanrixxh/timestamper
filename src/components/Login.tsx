 import { v4 as uuid } from 'uuid'

//Authorization URL
function buildURL(): string {
    const state = uuid()
    //TODO - Find some better method to build this link. Looks disgusting. Include scope specification with encoding
    var href = 'https://id.twitch.tv/oauth2/authorize?response_type=token+id_token&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0&redirect_uri=http://localhost:3000/logged&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls+openid&state='
    href += state
    return href
}

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