function Info(props) {
    return(
        <div>
            <h1 className="text-3xl font-bold">
            Hello {props.display_name}
            </h1>
            <h2> {props.game_name} </h2>
            <h2> {props.title} </h2>
        </div>
    )
}

export default Info