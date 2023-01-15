use tauri::{Manager, AppHandle, Window};
use url::Url;
use std::thread;
use std::thread::sleep;
use core::time::Duration;
use std::cell::RefCell;
use std::sync::{Arc, RwLock};

mod navigate;

const TWITCH_AUTH_URL: &str = concat!(
  "https://id.twitch.tv/oauth2/authorize?",
  "response_type=token",
  "&client_id=v89m5cded20ey1ppxxsi5ni53c3rv0",
  "&redirect_uri=https://timestamper/logged",
  "&scope=channel%3Amanage%3Abroadcast&state=1"
);
const TWITCH_REDIRECT_URL: &str = "https://timestamper/logged";

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]


#[tauri::command]
async fn twitch_auth_flow(app: AppHandle) -> String {
  //Build a new window to handle the auth flow
  let token = Arc::new(RwLock::new("empty".to_string()));
  let token_clone = token.clone();
  let token_read = token.clone();

  let window = tauri::WindowBuilder::new(&app, "twitch-auth", tauri::WindowUrl::App("../../index.html".into()))
      //When window navigates, capture url
      .on_navigation(move |url: url::Url| {
        let str = url.as_str();
        //Grab token from return url
        if str.starts_with(TWITCH_REDIRECT_URL) {
          if let Ok(mut result) = token_clone.write() {
            let url_vec = str.split("=").collect::<Vec<&str>>();
            *result = url_vec[1].split("&").collect::<Vec<&str>>()[0].to_string();
            println!("Token: {}", *result);
          }
        }
        true
      })
      .build()
      .unwrap();
  
  //Navigate to auth url
  let auth = Url::parse(TWITCH_AUTH_URL).unwrap();
  navigate::webview_navigate(&window, auth).unwrap();
  
  //Wait for recieved token
  let mut recieved = false;
  while recieved == false {
    if let Ok(read_token) = token_read.read() {
      if *read_token != "empty" {
        recieved = true;
        return (*read_token.clone()).to_string().into();
      }
    }
    sleep(Duration::from_millis(500));
  }

  return "failed_to_receive".to_string();
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      window.open_devtools();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![twitch_auth_flow])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}