import { getName } from "../utils/requests"
import { useState, useEffect } from 'react'

function grabToken(): string {
    const fullToken = window.location.hash
    let tokenStart = fullToken.indexOf("=") + 1
    let tokenEnd = fullToken.indexOf("&")
    let token = fullToken.slice(tokenStart, tokenEnd)
    return token
}

function Logged() {
    const [name, setName] = useState()
    let token = grabToken()

    useEffect(() => {
        async function loadName() {
            const newName = await getName(token)
            setName(newName)
    
        }
        loadName()
    })

    return (    
        <div className="loggedDiv">
            <h1 id="loginHeader" className="text-5xl font-bold text-slate-300 hover:text-slate-200 text-center">
                Welcome { name }
            </h1>
        </div>
    )
}


export default Logged