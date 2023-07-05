import '../styles/info.css'

function Info(props) {
    return(
        <div className="infoSection" style={{visibility: props.optionsOn ? 'hidden' : 'visible'}}>
            <div>
                { props.live === true &&  <h2 className="loggedDisplay">You are live!</h2> }
                { props.live === false && <h2 className="loggedDisplay">Offline</h2> }
            
                <h1 className="heading">
                Stream Info 
                </h1>
                
                    <h2 className="streamInfo"> {props.display_name} </h2>
                    <h2 className="streamInfo"> {props.game_name} </h2>
                    <h2 className="streamInfo"> {props.title} </h2>
            </div>

            <hr className="divider" />
            <hr />
        </div>
    )
}

export default Info