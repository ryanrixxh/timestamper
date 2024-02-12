# Why did development stop so soon?
### A few days after publishing the initial version of this software, I found another application that solves this problem, only much better.
https://firebot.app/ 
Firebot is a all-in-one Bot that can allow hotkey assignment amoung many other things. For this reason I've began to use this and recommend others do the same.
I'll keep timestamper up and available in case people would like to use it or fork it, but I'll be focusing my efforts on trying to solve problems that arent yet solved.

https://streamer.bot/
Streamer bot is another more configurable and extendible bot written in C# that allows for custom scripting

# Timestamper Early Development Version

## Build from source instructions...

### Requirements
- Rust
- npm: Node package manager (for installing frontend dependancies)
- cargo: Another package manager (for installing core dependancies)

### Build Instructions
1. Download or checkout the repository
2. Navigate to project directory and run `npm install`
3. Run `cargo tauri dev`


### Tech Stack
#### Core
- **Tauri** is a toolkit used for desktop application development. It is Rust based and renders Webviews which can be combined with frontend frameworks to create a web-like user interface. The core Rust functionality can be called by the frontend via the API system built in.

#### Frontend
- **Typescript** is used for the frontend user interface logic and the API which sends, recieves and processes data from Twitch. It also is responsible for invoking the core Rust API, and processes responses from the core. 
- **React** is used for the frontend UI components rendered inside of the webviews.
- **PostCSS** is used for more logical and structured styling throughout the application


