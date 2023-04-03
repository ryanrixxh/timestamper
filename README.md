# Timestamper Early Development Version

## Requirements
- Rust
- npm: Node package manager (for installing frontend dependancies)
- cargo: Another package manager (for installing core dependancies)

## Build Instructions
1. Download or checkout the repository
2. Navigate to project directory and run `npm install`
3. Run `cargo tauri dev`


## Tech Stack
### Core
- **Tauri** is a toolkit used for desktop application development. It is Rust based and renders Webviews which can be combined with frontend frameworks to create a web-like user interface. The core Rust functionality can be called by the frontend via the API system built in.

### Frontend
- **Typescript** is used for the frontend user interface logic and the API which sends, recieves and processes data from Twitch. It also is responsible for invoking the core Rust API, and processes responses from the core. 
- **React** is used for the frontend UI components rendered inside of the webviews.
- **PostCSS** is used for more logical and structured styling throughout the application


