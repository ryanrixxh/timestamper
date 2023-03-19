function Info(props) {
    return(
        <div>
            <h1 className="text-3xl font-bold">
            Stream Info 
            </h1>
            <h2> {props.display_name} </h2>
            <h2> {props.game_name} </h2>
            <h2> {props.title} </h2>
        </div>
    )
}

export default Info