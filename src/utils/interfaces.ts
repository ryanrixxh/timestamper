//Used for loading user details in the Login.tsx component 
//and for passing arguments to other requests
export interface User {
    id?: string,
    display_name?: string,
    login?: string,
}

//Used for loading stream details into the Live.tsx component
export interface Stream {
    game_name?: string,
    title?: string,
    category_name?: string,
    start_time?: string,
}

