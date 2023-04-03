import '../styles/info.css'

function Info(props) {
    return(
        <div className="infoSection">
            <h1 className="heading">
            Stream Info 
            </h1>
            <h2 className="streamInfo"> {props.display_name} </h2>
            <h2 className="streamInfo"> {props.game_name} </h2>
            <h2 className="streamInfo"> {props.title} </h2>
        </div>
    )
}

export default Info