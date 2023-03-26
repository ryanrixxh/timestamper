import '../styles/info.css'

function Info(props) {
    return(
        <div>
            <h1 className="tagline">
            Stream Info 
            </h1>
            <h2> {props.display_name} </h2>
            <h2> {props.game_name} </h2>
            <h2> {props.title} </h2>
        </div>
    )
}

export default Info