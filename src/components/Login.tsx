import react from 'react'
import { v4 as uuid } from 'uuid'

//TODO - PULL AND REVIEW

//Authorization URL
function buildURL(): string {
    const state = uuid()
    var href = 'https://id.twitch.tv/oauth2/authorize?response_type=token+id_token&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0&redirect_uri=http://localhost:3000&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls+openid&state='
    href += state
    return href
}


//Function for authorization returns true if the authorization has succeeded
function auth(): string {
    return 'user'
}

function Login() {
    const [user, setUser] = react.useState('none')
    const link = buildURL()

    return (
        <div className="helloDiv">
            { user === 'none' && 
            <h1 id="loginHeader" className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
                <a href={link}>Login to Twitch</a>
            </h1> }
            { user !== 'none' && 
            <h1 className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
                
            </h1> }
        </div>
    )
}

export default Login